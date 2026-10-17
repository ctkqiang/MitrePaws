#!/usr/bin/env node
/**
 * 简体中文本地化合并脚本（摄取管道第 4 阶段：Localize）
 *
 * 输入：
 * - src/data/seed/json/*.json（摄取脚本产出的英文种子，本脚本只改写 *_zh 语义字段）
 * - localization/zh/tactics.json（战术人工译名 + 译文描述）
 * - localization/zh/techniques.json（全部技术人工译名，键为外部编号）
 * - localization/zh/technique-descriptions.json（首批人工译校的技术描述）
 * - localization/glossary.zh.json（受控术语表：数据源 / 数据组件 / 缓解措施等）
 *
 * 输出：原地写回 src/data/seed/json/*.json，填充每个 BilingualText 的 zh 字段。
 *
 * 幂等保证：zh 永远由「英文种子 + 本地化文件」重新推导，重复运行结果一致。
 * 尚无人工译文的长描述（组织 / 软件 / 关系说明等）按规范占位为英文，
 * 并在结尾打印覆盖度报告，供后续译者补齐。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SEED_DIR = join(ROOT, 'src', 'data', 'seed', 'json');
const ZH_DIR = join(ROOT, 'localization', 'zh');

/**
 * 读取并解析 JSON 文件。
 *
 * @param {string} absPath - 文件绝对路径。
 * @returns {any} 解析结果。
 */
const readJson = (absPath) => JSON.parse(readFileSync(absPath, 'utf8'));

/**
 * 读取可选本地化文件；缺失时返回空表。
 *
 * @param {string} relPath - 相对 localization 目录的路径。
 * @returns {Record<string, unknown>} 本地化键值表。
 */
const readOptional = (relPath) => {
  try {
    return readJson(join(ROOT, 'localization', relPath));
  } catch {
    return {};
  }
};

const seed = {
  tactics: readJson(join(SEED_DIR, 'tactics.json')),
  techniques: readJson(join(SEED_DIR, 'techniques.json')),
  groups: readJson(join(SEED_DIR, 'groups.json')),
  software: readJson(join(SEED_DIR, 'software.json')),
  mitigations: readJson(join(SEED_DIR, 'mitigations.json')),
  campaigns: readJson(join(SEED_DIR, 'campaigns.json')),
  dataSources: readJson(join(SEED_DIR, 'dataSources.json')),
  dataComponents: readJson(join(SEED_DIR, 'dataComponents.json')),
  relationships: readJson(join(SEED_DIR, 'relationships.json')),
};

const tacticZh = readOptional(join('zh', 'tactics.json'));
const techniqueZh = readOptional(join('zh', 'techniques.json'));
const techniqueDescZh = readOptional(join('zh', 'technique-descriptions.json'));
const detectionStrategyZh = readOptional(join('zh', 'detection-strategies.json'));
const analyticZh = readOptional(join('zh', 'analytics.json'));
const glossary = readJson(join(ROOT, 'localization', 'glossary.zh.json'));

/** 技术英文名 → 中文译名反查表，供缓解措施同名概念复用。 */
const techniqueEnToZh = new Map(
  seed.techniques
    .filter((t) => techniqueZh[t.externalId])
    .map((t) => [t.name.en, techniqueZh[t.externalId]]),
);

/**
 * 构造双语字段：en 保持种子原文，zh 取译文或回退英文。
 *
 * @param {{en: string}} current - 种子中的现有双语结构。
 * @param {string | undefined} zh - 候选简体中文译文。
 * @returns {{en: string, zh: string}} 合并后的双语结构。
 */
const mergeBi = (current, zh) => ({ en: current.en, zh: zh ?? current.en });

const missing = {
  techniqueNames: [],
  mitigationNames: [],
  dataSourceNames: [],
  dataComponentNames: [],
  logSourceNames: [],
  techniqueDescriptions: 0,
};

// ------------------------------------------------------------------
// 战术：名称 + 描述均有完整人工译文
// ------------------------------------------------------------------
for (const tactic of seed.tactics) {
  const zhEntry = tacticZh[tactic.externalId];
  tactic.name = mergeBi(tactic.name, zhEntry?.name);
  tactic.description = mergeBi(tactic.description, zhEntry?.description);
}

// ------------------------------------------------------------------
// 技术：名称 100% 人工译名；描述按译校批次合入，其余暂回退英文
// ------------------------------------------------------------------
for (const technique of seed.techniques) {
  const nameZh = techniqueZh[technique.externalId];
  if (!nameZh) {
    missing.techniqueNames.push(technique.externalId);
  }
  technique.name = mergeBi(technique.name, nameZh);

  const descEntry = techniqueDescZh[technique.externalId];
  const descZh = typeof descEntry === 'string' ? descEntry : descEntry?.description;
  technique.description = mergeBi(technique.description, descZh);
  if (!descZh) {
    missing.techniqueDescriptions += 1;
  }

  if (technique.detection) {
    const detectionZh =
      typeof descEntry === 'object' && descEntry !== null ? descEntry.detection : undefined;
    technique.detection = mergeBi(technique.detection, detectionZh);
  }

  // 检测策略链：策略名称 / 分析项名称 / 描述走本地化文件，日志源名称走受控术语表
  for (const strategy of technique.detectionStrategies ?? []) {
    const dsEntry = detectionStrategyZh[strategy.id];
    if (dsEntry) {
      strategy.name = mergeBi(strategy.name, typeof dsEntry === 'string' ? dsEntry : dsEntry.name);
      if (strategy.description && strategy.description.en) {
        strategy.description = mergeBi(strategy.description, dsEntry.description);
      }
    }
    for (const analytic of strategy.analytics) {
      // Analytic 名称固定模式：Analytic NNNN → 分析项 NNNN，规则化不依赖人工译文
      if (analytic.name && analytic.name.en && analytic.name.en.startsWith('Analytic ')) {
        const num = analytic.name.en.slice('Analytic '.length);
        analytic.name = mergeBi(analytic.name, `分析项 ${num}`);
      }
      const anEntry = analyticZh[analytic.id];
      if (anEntry) {
        if (!(analytic.name.en && analytic.name.en.startsWith('Analytic '))) {
          analytic.name = mergeBi(analytic.name, typeof anEntry === 'string' ? undefined : anEntry.name);
        }
        analytic.description = mergeBi(analytic.description, typeof anEntry === 'string' ? anEntry : anEntry.description);
      }
      for (const ls of analytic.logSources) {
        if (ls.name && ls.name.en) {
          const lsZh = glossary[ls.name.en];
          if (!lsZh) {
            missing.logSourceNames.push(ls.name.en);
          }
          ls.name = mergeBi(ls.name, lsZh);
        }
      }
    }
  }

  // 结构化数据源引用：componentName / dataSourceName 走受控术语表
  const hasHan = (s) => /[\u4e00-\u9fff]/.test(s);
  for (const dc of technique.dataComponents ?? []) {
    if (dc.componentName) {
      const dcZh = glossary[dc.componentName];
      if (dcZh) {
        dc.componentName = dcZh;
      } else if (!hasHan(dc.componentName)) {
        missing.dataComponentNames.push(dc.componentName);
      }
    }
    if (dc.dataSourceName) {
      const dsZh = glossary[dc.dataSourceName];
      if (dsZh) {
        dc.dataSourceName = dsZh;
      } else if (!hasHan(dc.dataSourceName)) {
        missing.dataSourceNames.push(dc.dataSourceName);
      }
    }
  }
}

// ------------------------------------------------------------------
// 缓解措施：去掉 " Mitigation" 后缀后查受控术语表 / 技术同名译名
// ------------------------------------------------------------------
/**
 * 解析缓解措施名称的中文译文。
 *
 * @param {string} enName - 缓解措施英文名。
 * @returns {string | undefined} 命中时返回中文译名。
 */
const resolveMitigationName = (enName) => {
  const base = enName.replace(/ Mitigation$/, '');
  return glossary[base] ?? techniqueEnToZh.get(base);
};

for (const mitigation of seed.mitigations) {
  const nameZh = resolveMitigationName(mitigation.name.en);
  if (!nameZh) {
    missing.mitigationNames.push(`${mitigation.externalId} ${mitigation.name.en}`);
  }
  mitigation.name = mergeBi(mitigation.name, nameZh);
}

// ------------------------------------------------------------------
// 数据源 / 数据组件：名称走受控术语表
// ------------------------------------------------------------------
for (const dataSource of seed.dataSources) {
  const nameZh = glossary[dataSource.name.en];
  if (!nameZh) {
    missing.dataSourceNames.push(dataSource.name.en);
  }
  dataSource.name = mergeBi(dataSource.name, nameZh);
}

for (const dataComponent of seed.dataComponents) {
  const nameZh = glossary[dataComponent.name.en];
  if (!nameZh) {
    missing.dataComponentNames.push(dataComponent.name.en);
  }
  dataComponent.name = mergeBi(dataComponent.name, nameZh);
}

// ------------------------------------------------------------------
// 组织 / 软件 / 战役 / 关系：专有名与长文本留待后续批次，当前回退英文
// ------------------------------------------------------------------

/**
 * 把一条记录的 name/description 的 zh 占位为英文。
 *
 * @param {{name: {en:string}, description?: {en:string}}} record - 种子记录。
 */
const fallbackRecord = (record) => {
  record.name = mergeBi(record.name, undefined);
  if (record.description) {
    record.description = mergeBi(record.description, undefined);
  }
};

seed.groups.forEach(fallbackRecord);
seed.software.forEach(fallbackRecord);
seed.campaigns.forEach(fallbackRecord);

for (const relationship of seed.relationships) {
  if (relationship.description) {
    relationship.description = mergeBi(relationship.description, undefined);
  }
}

// ------------------------------------------------------------------
// 写回
// ------------------------------------------------------------------
const write = (name, data) =>
  writeFileSync(join(SEED_DIR, `${name}.json`), JSON.stringify(data), 'utf8');

write('tactics', seed.tactics);
write('techniques', seed.techniques);
write('groups', seed.groups);
write('software', seed.software);
write('mitigations', seed.mitigations);
write('campaigns', seed.campaigns);
write('dataSources', seed.dataSources);
write('dataComponents', seed.dataComponents);
write('relationships', seed.relationships);

// ------------------------------------------------------------------
// 覆盖度报告
// ------------------------------------------------------------------
const report = (label, items) => {
  if (items.length === 0) {
    console.log(`[OK] ${label}：100%`);
    return;
  }
  console.log(`[缺译文] ${label}（${items.length}）：\n  ${items.slice(0, 30).join('\n  ')}`);
};

console.log('本地化合并完成');
report('技术名称', missing.techniqueNames);
report('缓解措施名称', missing.mitigationNames);
report('数据源名称', missing.dataSourceNames);
report('数据组件名称', missing.dataComponentNames);
report('日志源名称', missing.logSourceNames);
console.log(
  `[信息] 技术描述已译 ${seed.techniques.length - missing.techniqueDescriptions}/${seed.techniques.length}；`,
);
