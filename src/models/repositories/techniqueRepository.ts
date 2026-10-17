/**
 * 技术仓储 — 技术 / 子技术的只读访问，含矩阵与详情视图组装。
 *
 * 全部纯函数；书签状态以 bookmarkIds 入参注入，仓储不 import UI 层。
 */

import { SEED_TECHNIQUES } from '@/data/seed';
import type { Tactic, Technique } from '@/types/stix';
import type {
    MatrixColumn,
    MatrixTechniqueCell,
    TechniqueDetailViewData,
    TechniqueListItem,
} from '@/types/viewData';

import * as campaignRepository from './campaignRepository';
import * as groupRepository from './groupRepository';
import * as mitigationRepository from './mitigationRepository';
import * as relationshipRepository from './relationshipRepository';
import * as softwareRepository from './softwareRepository';
import * as tacticRepository from './tacticRepository';

/** 按外部编号升序比较。 */
const byExternalId = (a: { externalId: string }, b: { externalId: string }): number =>
  a.externalId.localeCompare(b.externalId);

/**
 * 返回全部技术（含子技术），按外部编号升序。
 *
 * @returns {Technique[]} 技术列表。
 */
export const all = (): Technique[] => [...SEED_TECHNIQUES].sort(byExternalId);

/**
 * 按 id（外部编号）查找技术。
 *
 * @param {string} id - 技术外部编号，如 T1059.004。
 * @returns {Technique | null} 命中返回技术，否则返回 null。
 */
export const byId = (id: string): Technique | null => SEED_TECHNIQUES.find((t) => t.id === id) ?? null;

/**
 * 返回归属指定战术的全部技术，按外部编号升序。
 *
 * @param {string} tacticId - 战术外部编号，如 TA0002。
 * @returns {Technique[]} 该战术下的技术列表。
 */
export const byTactic = (tacticId: string): Technique[] =>
  all().filter((t) => t.tacticIds.includes(tacticId));

/**
 * 返回指定父技术的全部子技术，按外部编号升序。
 *
 * @param {string} parentId - 父技术外部编号，如 T1059。
 * @returns {Technique[]} 子技术列表。
 */
export const subtechniques = (parentId: string): Technique[] =>
  all().filter((t) => t.parentId === parentId);

/**
 * 统计指定主技术的子技术数量。
 *
 * @param {string} parentId - 父技术外部编号。
 * @returns {number} 子技术数量。
 */
const subtechniqueCount = (parentId: string): number =>
  SEED_TECHNIQUES.filter((t) => t.parentId === parentId).length;

/**
 * 解析技术所属的第一个战术 shortname（列表副标题用）。
 *
 * @param {Technique} technique - 技术条目。
 * @returns {string} 第一个战术的 shortname；无战术时返回空串。
 */
const firstTacticShortname = (technique: Technique): string => {
  const firstId = technique.tacticIds[0];
  if (firstId === undefined) {
    return '';
  }
  const tactic = tacticRepository.byId(firstId);
  return tactic?.shortname ?? '';
};

/**
 * 返回技术列表行数据，标注书签状态。
 *
 * @param {readonly string[]} bookmarkIds - 当前已收藏的外部编号列表。
 * @returns {TechniqueListItem[]} 按外部编号升序的列表行。
 */
export const listItems = (bookmarkIds: readonly string[]): TechniqueListItem[] =>
  all().map((t) => ({
    id: t.id,
    externalId: t.externalId,
    name: t.name,
    tacticShortname: firstTacticShortname(t),
    isSubtechnique: t.isSubtechnique,
    isBookmarked: bookmarkIds.includes(t.id),
  }));

/**
 * 组装 ATT&CK 矩阵列：每列是一个战术及其下的主技术。
 *
 * @returns {MatrixColumn[]} 按战术 ordinal 升序的矩阵列。
 */
export const matrixColumns = (): MatrixColumn[] =>
  tacticRepository.all().map((tactic) => ({
    externalId: tactic.externalId,
    shortname: tactic.shortname,
    name: tactic.name,
    techniques: byTactic(tactic.id)
      .filter((t) => !t.isSubtechnique)
      .map(
        (t): MatrixTechniqueCell => ({
          id: t.id,
          externalId: t.externalId,
          name: t.name,
          subtechniqueCount: subtechniqueCount(t.id),
        }),
      ),
  }));

/**
 * 组装技术详情视图数据。
 *
 * 经 relationships 反查使用方（组织 / 软件）与缓解措施；
 * 技术不存在时返回 null，让上层决定渲染 not-found。
 *
 * @param {string} id - 技术外部编号。
 * @param {readonly string[]} bookmarkIds - 当前已收藏的外部编号列表。
 * @returns {TechniqueDetailViewData | null} 详情视图数据；未命中返回 null。
 */
export const detail = (
  id: string,
  bookmarkIds: readonly string[],
): TechniqueDetailViewData | null => {
  const technique = byId(id);
  if (technique === null) {
    return null;
  }

  const tactics: TechniqueDetailViewData['tactics'] = technique.tacticIds
    .map((tid) => tacticRepository.byId(tid))
    .filter((t): t is Tactic => t !== null)
    .map((t) => ({ externalId: t.externalId, name: t.name }));

  const parent =
    technique.parentId === null
      ? null
      : (() => {
          const p = byId(technique.parentId);
          return p === null ? null : { externalId: p.externalId, name: p.name };
        })();

  const subs = subtechniques(technique.id).map((t) => ({
    externalId: t.externalId,
    name: t.name,
  }));

  const usedBy: TechniqueDetailViewData['usedBy'] = [];
  const procedureExamples: TechniqueDetailViewData['procedureExamples'] = [];
  for (const rel of relationshipRepository.byTypeAndTarget('uses', technique.id)) {
    const group = groupRepository.byId(rel.sourceId);
    if (group !== null) {
      usedBy.push({ kind: 'group', externalId: group.externalId, name: group.name });
      if (rel.description) {
        procedureExamples.push({
          kind: 'group',
          externalId: group.externalId,
          name: group.name,
          description: rel.description.zh !== rel.description.en ? rel.description.zh : rel.description.en,
        });
      }
      continue;
    }
    const software = softwareRepository.byId(rel.sourceId);
    if (software !== null) {
      usedBy.push({ kind: 'software', externalId: software.externalId, name: software.name });
      if (rel.description) {
        procedureExamples.push({
          kind: 'software',
          externalId: software.externalId,
          name: software.name,
          description: rel.description.zh !== rel.description.en ? rel.description.zh : rel.description.en,
        });
      }
      continue;
    }
    const campaign = campaignRepository.byId(rel.sourceId);
    if (campaign !== null) {
      usedBy.push({ kind: 'campaign', externalId: campaign.externalId, name: campaign.name });
      if (rel.description) {
        procedureExamples.push({
          kind: 'campaign',
          externalId: campaign.externalId,
          name: campaign.name,
          description: rel.description.zh !== rel.description.en ? rel.description.zh : rel.description.en,
        });
      }
    }
  }
  usedBy.sort(byExternalId);
  procedureExamples.sort(byExternalId);

  const mitigations: TechniqueDetailViewData['mitigations'] = relationshipRepository
    .byTypeAndTarget('mitigates', technique.id)
    .map((rel) => mitigationRepository.byId(rel.sourceId))
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .map((m) => ({ externalId: m.externalId, name: m.name }))
    .sort(byExternalId);

  return {
    id: technique.id,
    externalId: technique.externalId,
    name: technique.name,
    description: technique.description,
    detection: technique.detection,
    platforms: technique.platforms,
    revoked: technique.revoked,
    deprecated: technique.deprecated,
    tactics,
    parent,
    subtechniques: subs,
    usedBy,
    procedureExamples,
    mitigations,
    dataComponents: technique.dataComponents,
    detectionStrategies: technique.detectionStrategies,
    version: technique.version,
    created: technique.created,
    modified: technique.modified,
    contributors: technique.contributors,
    remoteSupport: technique.remoteSupport,
    impactType: technique.impactType,
    capecIds: technique.capecIds,
    references: technique.references,
    isBookmarked: bookmarkIds.includes(technique.id),
  };
};
