/**
 * 离线搜索服务 — 对种子五表做纯本地匹配与评分。
 *
 * 匹配覆盖战术 / 技术 / 组织 / 软件 / 缓解措施五张表；
 * 缓解措施命中不进结果（SearchHit.kind 不含 mitigation）。
 * 评分权重集中在 SCORING 常量；非当前语言命中整体 ×0.6；
 * tacticFilter 只过滤技术命中。结果按 score 降序，至多 50 条。
 */

import {
    SEED_CAMPAIGNS,
    SEED_DATA_SOURCES,
    SEED_GROUPS,
    SEED_MITIGATIONS,
    SEED_SOFTWARE,
    SEED_TACTICS,
    SEED_TECHNIQUES,
} from '@/data/seed';
import type { BilingualText, EntityKind, Locale } from '@/types/stix';
import type { SearchHit } from '@/types/viewData';

/** 评分权重与结果上限。 */
export const SCORING = {
  /** 名称完全相等。 */
  nameExact: 100,
  /** 名称前缀命中。 */
  namePrefix: 80,
  /** 名称包含命中。 */
  nameContains: 60,
  /** 外部编号命中。 */
  externalId: 90,
  /** 描述包含命中。 */
  description: 30,
  /** 非当前语言命中的折算系数。 */
  crossLocaleFactor: 0.6,
  /** 返回结果上限。 */
  maxResults: 50,
} as const;

/** 匹配池中的实体种类（含 mitigation，但 mitigation 不进结果）。 */
type PoolKind = EntityKind | 'mitigation';

/** 匹配池条目。 */
type PoolEntry = {
  kind: PoolKind;
  id: string;
  externalId: string;
  name: BilingualText;
  description: BilingualText;
  /** 仅技术有；用于 tacticFilter 过滤与 tacticShortname 输出。 */
  tacticIds: readonly string[];
};

/** 战术 id → shortname 查找表。 */
const TACTIC_SHORTNAME: ReadonlyMap<string, string> = new Map(
  SEED_TACTICS.map((t) => [t.id, t.shortname] as const),
);

/** 模块层匹配池：五表统一形状，构建一次复用。 */
const SEARCH_POOL: readonly PoolEntry[] = [
  ...SEED_TACTICS.map(
    (t): PoolEntry => ({
      kind: 'tactic',
      id: t.id,
      externalId: t.externalId,
      name: t.name,
      description: t.description,
      tacticIds: [],
    }),
  ),
  ...SEED_TECHNIQUES.map(
    (t): PoolEntry => ({
      kind: 'technique',
      id: t.id,
      externalId: t.externalId,
      name: t.name,
      description: t.description,
      tacticIds: t.tacticIds,
    }),
  ),
  ...SEED_GROUPS.map(
    (g): PoolEntry => ({
      kind: 'group',
      id: g.id,
      externalId: g.externalId,
      name: g.name,
      description: g.description,
      tacticIds: [],
    }),
  ),
  ...SEED_SOFTWARE.map(
    (s): PoolEntry => ({
      kind: 'software',
      id: s.id,
      externalId: s.externalId,
      name: s.name,
      description: s.description,
      tacticIds: [],
    }),
  ),
  ...SEED_MITIGATIONS.map(
    (m): PoolEntry => ({
      kind: 'mitigation',
      id: m.id,
      externalId: m.externalId,
      name: m.name,
      description: m.description,
      tacticIds: [],
    }),
  ),
  ...SEED_CAMPAIGNS.map(
    (c): PoolEntry => ({
      kind: 'campaign',
      id: c.id,
      externalId: c.externalId,
      name: c.name,
      description: c.description,
      tacticIds: [],
    }),
  ),
  ...SEED_DATA_SOURCES.map(
    (ds): PoolEntry => ({
      kind: 'dataSource',
      id: ds.id,
      externalId: ds.externalId,
      name: ds.name,
      description: ds.description,
      tacticIds: [],
    }),
  ),
];

/** 当前语言的互补语言查找表。 */
const OTHER_LOCALE: Record<Locale, Locale> = { en: 'zh', zh: 'en' };

/**
 * 计算名称字段对查询的得分；未命中返回 null。
 *
 * @param {string} name - 待匹配的名称文本。
 * @param {string} query - 已小写化的查询串。
 * @returns {number | null} 命中的分数，未命中为 null。
 */
const nameScore = (name: string, query: string): number | null => {
  const lower = name.toLowerCase();
  if (lower === query) {
    return SCORING.nameExact;
  }
  if (lower.startsWith(query)) {
    return SCORING.namePrefix;
  }
  if (lower.includes(query)) {
    return SCORING.nameContains;
  }
  return null;
};

/**
 * 计算外部编号对查询的得分；未命中返回 null。
 *
 * @param {string} externalId - 实体外部编号。
 * @param {string} query - 已小写化的查询串。
 * @returns {number | null} 命中的分数，未命中为 null。
 */
const externalIdScore = (externalId: string, query: string): number | null =>
  externalId.toLowerCase().startsWith(query) ? SCORING.externalId : null;

/**
 * 计算描述字段对查询的得分；未命中返回 null。
 *
 * @param {string} description - 待匹配的描述文本。
 * @param {string} query - 已小写化的查询串。
 * @returns {number | null} 命中的分数，未命中为 null。
 */
const descriptionScore = (description: string, query: string): number | null =>
  description.toLowerCase().includes(query) ? SCORING.description : null;

/**
 * 汇总单个实体的最终得分。
 *
 * 当前语言命中取全分；仅非当前语言命中时按 crossLocaleFactor 折算；
 * 外部编号是语言中立字段，始终取全分。
 *
 * @param {PoolEntry} entry - 匹配池条目。
 * @param {string} query - 已小写化的查询串。
 * @param {Locale} locale - 当前语言。
 * @returns {number | null} 最终得分；完全未命中返回 null。
 */
const scoreEntry = (entry: PoolEntry, query: string, locale: Locale): number | null => {
  const other = OTHER_LOCALE[locale];
  const candidates: number[] = [];

  const primaryName = nameScore(entry.name[locale], query);
  if (primaryName !== null) {
    candidates.push(primaryName);
  }
  const idHit = externalIdScore(entry.externalId, query);
  if (idHit !== null) {
    candidates.push(idHit);
  }
  const primaryDesc = descriptionScore(entry.description[locale], query);
  if (primaryDesc !== null) {
    candidates.push(primaryDesc);
  }
  const otherName = nameScore(entry.name[other], query);
  if (otherName !== null) {
    candidates.push(otherName * SCORING.crossLocaleFactor);
  }
  const otherDesc = descriptionScore(entry.description[other], query);
  if (otherDesc !== null) {
    candidates.push(otherDesc * SCORING.crossLocaleFactor);
  }

  if (candidates.length === 0) {
    return null;
  }
  return Math.max(...candidates);
};

/**
 * 解析技术命中项所属的第一个战术 shortname。
 *
 * @param {PoolEntry} entry - 匹配池条目。
 * @returns {string | null} 技术返回 shortname；其他实体或无战术时返回 null。
 */
const resolveTacticShortname = (entry: PoolEntry): string | null => {
  if (entry.kind !== 'technique') {
    return null;
  }
  const firstId = entry.tacticIds[0];
  if (firstId === undefined) {
    return null;
  }
  return TACTIC_SHORTNAME.get(firstId) ?? null;
};

/**
 * 在种子五表内做离线搜索。
 *
 * @param {string} query - 原始查询串；空白查询返回空数组。
 * @param {Locale} locale - 当前语言；非当前语言命中按 0.6 折算。
 * @param {string | null} tacticFilter - 战术过滤（技术命中须归属该战术）；null 表示不过滤。
 * @returns {SearchHit[]} 按得分降序、至多 50 条的命中列表。
 *
 * @example
 * search('powershell', 'zh', null);
 */
export const search = (
  query: string,
  locale: Locale,
  tacticFilter: string | null = null,
): SearchHit[] => {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return [];
  }

  const hits: SearchHit[] = [];
  for (const entry of SEARCH_POOL) {
    const score = scoreEntry(entry, normalized, locale);
    if (score === null) {
      continue;
    }
    // 缓解措施参与匹配但不进入结果。
    if (entry.kind === 'mitigation') {
      continue;
    }
    // tacticFilter 只约束技术命中。
    if (
      entry.kind === 'technique' &&
      tacticFilter !== null &&
      !entry.tacticIds.includes(tacticFilter)
    ) {
      continue;
    }
    hits.push({
      kind: entry.kind,
      id: entry.id,
      externalId: entry.externalId,
      name: entry.name,
      tacticShortname: resolveTacticShortname(entry),
      score,
    });
  }

  return hits
    .sort((a, b) => b.score - a.score || a.externalId.localeCompare(b.externalId))
    .slice(0, SCORING.maxResults);
};
