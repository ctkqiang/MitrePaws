#!/usr/bin/env node
/**
 * MITRE ATT&CK Enterprise STIX 2.1 → MitrePaws 种子数据摄取脚本
 *
 * 输入：scripts/enterprise-attack.json（官方 STIX 2.1 数据包）
 * 输出：src/data/seed/json/*.json（紧凑 JSON）
 *
 * 处理流程：
 * 1. 过滤掉 revoked（已撤销）的墓碑对象，保留 deprecated（已废弃）的标记。
 * 2. 从 external_references 提取 MITRE 外部编号（T/G/S/TA/M/DS 前缀）。
 * 3. 技术 / 子技术识别：x_mitre_is_subtechnique；父子关系走 relationship_type=subtechnique-of。
 * 4. 检测建议优先级：x_mitre_detection 字段 > detects 关系拼装的数据组件名称列表。
 * 5. 简体中文字段当前为英文占位（zh = en），留待后续翻译管道填充。
 * 6. 描述清理：移除 Citation 标注与 Markdown 链接语法，压缩空白。
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IN = join(ROOT, 'scripts', 'enterprise-attack.json');
const OUT = join(ROOT, 'src', 'data', 'seed', 'json');

mkdirSync(OUT, { recursive: true });

// ------------------------------------------------------------------
// 读取 STIX 2.1 数据包
// ------------------------------------------------------------------
const bundle = JSON.parse(
  (await import('node:fs')).readFileSync(IN, 'utf8'),
);
const objects = bundle.objects ?? [];

// ------------------------------------------------------------------
// 工具函数
// ------------------------------------------------------------------

/**
 * 清理 STIX 描述文本：移除 Citation、Markdown 链接，压缩空白。
 *
 * @param {string} raw - 原始描述。
 * @returns {string} 清理后文本。
 */
function clean(raw) {
  if (!raw) return '';
  return raw
    .replace(/\s*\(Citation:[^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 把英文文本包装为 BilingualText（zh 占位）。
 *
 * @param {string} en - 英文文本。
 * @returns {{en:string,zh:string}} 双语结构。
 */
function bi(en) {
  const text = clean(en);
  return { en: text, zh: text };
}

/**
 * 从 external_references 提取 MITRE 外部编号。
 *
 * @param {object} obj - STIX 对象。
 * @returns {string|null} 外部编号或 null。
 */
function extId(obj) {
  const refs = obj.external_references ?? [];
  const r = refs.find(
    (ref) => ref.source_name === 'mitre-attack' && ref.external_id,
  );
  return r ? r.external_id : null;
}

/**
 * 判断对象是否存活（未撤销）。
 *
 * @param {object} obj - STIX 对象。
 * @returns {boolean} 未撤销返回 true。
 */
function isLive(obj) {
  return obj.revoked !== true;
}

// ------------------------------------------------------------------
// 预扫描：stix id → 外部编号映射 & 对象分类
// ------------------------------------------------------------------

const extIdMap = new Map();
const typeMap = new Map();

for (const obj of objects) {
  if (obj.id) {
    typeMap.set(obj.id, obj.type);
    const eid = extId(obj);
    if (eid) extIdMap.set(obj.id, eid);
  }
}

// ------------------------------------------------------------------
// 战术（x-mitre-tactic）与矩阵序
// ------------------------------------------------------------------
const matrix = objects.find((o) => o.type === 'x-mitre-matrix');
const tacticOrder = matrix
  ? matrix.tactic_refs.map((ref) => extIdMap.get(ref)).filter(Boolean)
  : [];

const rawTactics = objects.filter(
  (o) => o.type === 'x-mitre-tactic' && isLive(o),
);
const tactics = rawTactics
  .map((t) => {
    const eid = extId(t);
    return {
      id: eid,
      externalId: eid,
      shortname: t.x_mitre_shortname ?? eid ?? '',
      name: bi(t.name),
      description: bi(t.description),
      ordinal: tacticOrder.indexOf(eid),
    };
  })
  .filter((t) => t.externalId)
  .sort((a, b) => a.ordinal - b.ordinal);

const shortnameToId = new Map(tactics.map((t) => [t.shortname, t.id]));

// ------------------------------------------------------------------
// 技术（attack-pattern）
// ------------------------------------------------------------------
const rawTechniques = objects.filter(
  (o) => o.type === 'attack-pattern' && isLive(o),
);

const techniqueMap = new Map();
for (const t of rawTechniques) {
  const eid = extId(t);
  if (!eid) continue;
  techniqueMap.set(t.id, eid);
}

// 父子关系（subtechnique-of）
const parentOf = new Map(); // child stix id -> parent stix id
for (const r of objects) {
  if (
    r.type === 'relationship' &&
    r.relationship_type === 'subtechnique-of'
  ) {
    parentOf.set(r.source_ref, r.target_ref);
  }
}

// ------------------------------------------------------------------
// 检测策略链：technique ← detects ← detection-strategy → analytic_refs → analytic → data-component
// ------------------------------------------------------------------

// 检测策略 → 技术的映射
const detectsByTechnique = new Map(); // technique stix id -> [{ strategyId, strategyName, analytics }]
// 结构化数据源：technique stix id -> [{ componentName, dataSourceId, dataSourceName }]
const dataComponentsByTechnique = new Map();

/** data source stix id -> { extId, name } 预索引，供结构化组装反查。 */
const dataSourceInfo = new Map();
for (const o of objects) {
  if (o.type === 'x-mitre-data-source' && isLive(o)) {
    dataSourceInfo.set(o.id, { extId: extId(o), name: clean(o.name ?? '') });
  }
}

/** data component stix id -> { name, dataSourceRef } 预索引 */
const dataComponentInfo = new Map();
for (const o of objects) {
  if (o.type === 'x-mitre-data-component' && isLive(o)) {
    dataComponentInfo.set(o.id, {
      name: clean(o.name ?? ''),
      dataSourceRef: o.x_mitre_data_source_ref,
    });
  }
}

/** analytic stix id -> analytic 对象 */
const analyticMap = new Map();
for (const o of objects) {
  if (o.type === 'x-mitre-analytic' && isLive(o)) {
    analyticMap.set(o.id, o);
  }
}

/** detection strategy stix id -> strategy 对象 */
const detectionStrategyMap = new Map();
for (const o of objects) {
  if (o.type === 'x-mitre-detection-strategy' && isLive(o)) {
    detectionStrategyMap.set(o.id, o);
  }
}

// 处理 detects 关系：detection-strategy -> attack-pattern
for (const r of objects) {
  if (r.type === 'relationship' && r.relationship_type === 'detects') {
    const strategy = detectionStrategyMap.get(r.source_ref);
    if (!strategy) continue;

    const techniqueId = r.target_ref;
    const strategyName = clean(strategy.name ?? '');
    const analyticRefs = strategy.x_mitre_analytic_refs ?? [];

    // 收集该策略下所有分析的数据组件
    const analytics = [];
    const components = new Set(); // 去重

    for (const analyticId of analyticRefs) {
      const analytic = analyticMap.get(analyticId);
      if (!analytic) continue;

      const analyticName = clean(analytic.name ?? '');
      const analyticDesc = clean(analytic.description ?? '');
      const logSources = analytic.x_mitre_log_source_references ?? [];

      const componentRefs = [];
      for (const ls of logSources) {
        const dcRef = ls.x_mitre_data_component_ref;
        if (!dcRef) continue;

        const dcInfo = dataComponentInfo.get(dcRef);
        if (!dcInfo) continue;

        componentRefs.push({
          name: dcInfo.name,
          sourceRef: dcInfo.dataSourceRef,
          logSourceName: ls.name,
          channel: ls.channel,
        });

        // 添加到技术的结构化数据组件（去重）
        const dsInfo = dataSourceInfo.get(dcInfo.dataSourceRef);
        const key = `${dcInfo.name}|${dsInfo?.extId ?? ''}`;
        if (!components.has(key)) {
          components.add(key);
          const structured = dataComponentsByTechnique.get(techniqueId) ?? [];
          structured.push({
            componentName: dcInfo.name,
            dataSourceId: dsInfo?.extId ?? null,
            dataSourceName: dsInfo?.name ?? null,
          });
          dataComponentsByTechnique.set(techniqueId, structured);
        }
      }

      analytics.push({
        id: analyticId,
        name: analyticName,
        description: analyticDesc,
        platforms: analytic.x_mitre_platforms ?? [],
        logSources: componentRefs,
      });
    }

    // 存储检测策略信息
    const existing = detectsByTechnique.get(techniqueId) ?? [];
    existing.push({
      strategyId: strategy.id,
      strategyName,
      strategyDescription: clean(strategy.description ?? ''),
      analytics,
    });
    detectsByTechnique.set(techniqueId, existing);
  }
}

const techniques = rawTechniques
  .map((t) => {
    const eid = extId(t);
    if (!eid) return null;
    const kcp = (t.kill_chain_phases ?? []).filter(
      (p) => p.kill_chain_name === 'mitre-attack',
    );
    const tacticIds = kcp
      .map((p) => shortnameToId.get(p.phase_name))
      .filter(Boolean);
    const parentStixId = parentOf.get(t.id);
    const parentId = parentStixId ? techniqueMap.get(parentStixId) ?? null : null;

    const rawDetection = t.x_mitre_detection ? clean(t.x_mitre_detection) : null;
    const strategies = detectsByTechnique.get(t.id) ?? [];
    // 组装检测文本：优先 x_mitre_detection，其次检测策略中的数据组件名
    const dcNames = strategies.flatMap((s) => s.analytics.flatMap((a) => a.logSources.map((ls) => ls.name)));
    const assembledDetection = dcNames.length > 0 ? [...new Set(dcNames)].join('; ') : null;
    const detectionText = rawDetection ?? assembledDetection;

    // 检测策略详情（完整还原官网 Detection 区块）
    const detectionStrategies = strategies.map((s) => ({
      id: s.strategyId,
      name: s.strategyName,
      description: s.strategyDescription,
      analytics: s.analytics.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        platforms: a.platforms,
        logSources: a.logSources.map((ls) => ({
          name: ls.name,
          channel: ls.channel,
        })),
      })),
    }));

    // 外部引用：排除 mitre-attack 自述条目，保留含 url 或 external_id 的真实引用
    const references = (t.external_references ?? [])
      .filter((r) => r.source_name !== 'mitre-attack' && (r.url || r.external_id))
      .map((r) => ({
        sourceName: r.source_name ?? '',
        url: r.url ?? null,
        description: r.description ? clean(r.description) : null,
        externalId: r.external_id ?? null,
      }));

    // CAPEC 交叉编号（如 CAPEC-549）
    const capecIds = (t.external_references ?? [])
      .filter((r) => r.source_name === 'capec' && r.external_id)
      .map((r) => r.external_id);

    return {
      id: eid,
      externalId: eid,
      parentId,
      isSubtechnique: t.x_mitre_is_subtechnique === true,
      name: bi(t.name),
      description: bi(t.description),
      detection: detectionText ? bi(detectionText) : null,
      tacticIds: [...new Set(tacticIds)],
      platforms: t.x_mitre_platforms ?? [],
      revoked: false,
      deprecated: t.x_mitre_deprecated === true || t.x_mitre_deprecated === 'true',
      // ---- 官网完整字段 ----
      version: t.x_mitre_version ?? null,
      created: t.created ?? null,
      modified: t.modified ?? null,
      contributors: t.x_mitre_contributors ?? [],
      remoteSupport: t.x_mitre_remote_support === true ? true : null,
      impactType: t.x_mitre_impact_type ?? [],
      capecIds,
      references,
      dataComponents: dataComponentsByTechnique.get(t.id) ?? [],
      detectionStrategies,
    };
  })
  .filter(Boolean);

// ------------------------------------------------------------------
// 组织（intrusion-set）
// ------------------------------------------------------------------
const groups = objects
  .filter((o) => o.type === 'intrusion-set' && isLive(o))
  .map((g) => {
    const eid = extId(g);
    return {
      id: eid,
      externalId: eid,
      name: bi(g.name),
      description: bi(g.description),
      aliases: g.aliases ?? [],
    };
  })
  .filter((g) => g.externalId);

// ------------------------------------------------------------------
// 软件（malware + tool）
// ------------------------------------------------------------------
const software = objects
  .filter((o) => (o.type === 'malware' || o.type === 'tool') && isLive(o))
  .map((s) => {
    const eid = extId(s);
    return {
      id: eid,
      externalId: eid,
      kind: s.type === 'malware' ? 'malware' : 'tool',
      name: bi(s.name),
      description: bi(s.description),
      platforms: s.x_mitre_platforms ?? [],
    };
  })
  .filter((s) => s.externalId);

// ------------------------------------------------------------------
// 缓解措施（course-of-action）
// ------------------------------------------------------------------
const mitigations = objects
  .filter((o) => o.type === 'course-of-action' && isLive(o))
  .map((m) => {
    const eid = extId(m);
    return {
      id: eid,
      externalId: eid,
      name: bi(m.name),
      description: bi(m.description),
    };
  })
  .filter((m) => m.externalId);

// ------------------------------------------------------------------
// 战役（campaign）
// ------------------------------------------------------------------
const campaigns = objects
  .filter((o) => o.type === 'campaign' && isLive(o))
  .map((c) => {
    const eid = extId(c);
    return {
      id: eid,
      externalId: eid,
      name: bi(c.name),
      description: bi(c.description),
      aliases: c.aliases ?? [],
      firstSeen: c.first_seen ?? null,
      lastSeen: c.last_seen ?? null,
    };
  })
  .filter((c) => c.externalId);

// ------------------------------------------------------------------
// 数据源（x-mitre-data-source）
// ------------------------------------------------------------------
const dataSources = objects
  .filter((o) => o.type === 'x-mitre-data-source' && isLive(o))
  .map((ds) => {
    const eid = extId(ds);
    return {
      id: eid,
      externalId: eid,
      name: bi(ds.name),
      description: bi(ds.description),
      collectionLayers: ds.x_mitre_collection_layers ?? [],
    };
  })
  .filter((ds) => ds.externalId);

// ------------------------------------------------------------------
// 数据组件（x-mitre-data-component）
// ------------------------------------------------------------------
const dataComponents = objects
  .filter((o) => o.type === 'x-mitre-data-component' && isLive(o))
  .map((dc) => {
    const sourceId = extIdMap.get(dc.x_mitre_data_source_ref) ?? dc.x_mitre_data_source_ref;
    return {
      id: dc.id,
      name: bi(dc.name),
      description: bi(dc.description),
      dataSourceId: sourceId,
    };
  });

// ------------------------------------------------------------------
// 关系（uses + mitigates → technique）
// ------------------------------------------------------------------
const entityIds = new Set([
  ...tactics.map((t) => t.id),
  ...techniques.map((t) => t.id),
  ...groups.map((g) => g.id),
  ...software.map((s) => s.id),
  ...mitigations.map((m) => m.id),
  ...campaigns.map((c) => c.id),
]);

const relationships = objects
  .filter(
    (o) =>
      o.type === 'relationship' &&
      (o.relationship_type === 'uses' || o.relationship_type === 'mitigates'),
  )
  .map((r) => {
    const sourceId = extIdMap.get(r.source_ref) ?? r.source_ref;
    const targetId = extIdMap.get(r.target_ref) ?? r.target_ref;
    const desc = r.description ? clean(r.description) : null;
    if (!entityIds.has(sourceId) || !entityIds.has(targetId)) return null;
    // uses 的目标必须是技术，否则跳过（如组织使用软件的关系）
    if (r.relationship_type === 'uses' && !techniqueMap.has(r.target_ref)) return null;
    return {
      id: r.id,
      type: r.relationship_type,
      sourceId,
      targetId,
      description: desc ? bi(desc) : null,
    };
  })
  .filter(Boolean);

// ------------------------------------------------------------------
// 清单
// ------------------------------------------------------------------
const collection = objects.find((o) => o.type === 'x-mitre-collection');
const manifest = {
  attackRelease: collection?.name ?? 'MITRE ATT&CK',
  version: collection?.modified ?? '',
  domain: 'enterprise-attack',
  generatedAt: new Date().toISOString().slice(0, 10),
  counts: {
    tactics: tactics.length,
    techniques: techniques.length,
    groups: groups.length,
    software: software.length,
    mitigations: mitigations.length,
    campaigns: campaigns.length,
    dataSources: dataSources.length,
    dataComponents: dataComponents.length,
    relationships: relationships.length,
  },
  schemaVersion: 2,
};

// ------------------------------------------------------------------
// 写入 JSON
// ------------------------------------------------------------------
const write = (name, data) =>
  writeFileSync(join(OUT, `${name}.json`), JSON.stringify(data), 'utf8');

write('tactics', tactics);
write('techniques', techniques);
write('groups', groups);
write('software', software);
write('mitigations', mitigations);
write('campaigns', campaigns);
write('dataSources', dataSources);
write('dataComponents', dataComponents);
write('relationships', relationships);
write('manifest', manifest);

console.log('✅ 摄取完成');
console.log(manifest.counts);
