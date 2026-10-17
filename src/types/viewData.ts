/**
 * 展示层数据契约 — ViewModel 返回给 View 的形状。
 *
 * View 只消费这里定义的类型，绝不接触种子原始结构。
 * 所有名称字段保留 BilingualText，由 View 依据当前 locale 取值。
 */

import type { BilingualText, DetectionStrategy, EntityKind, Locale } from './stix';

/** 矩阵列（战术）及其下的主技术。 */
export type MatrixColumn = {
  externalId: string;
  shortname: string;
  name: BilingualText;
  techniques: MatrixTechniqueCell[];
};

/** 矩阵单元格里的技术。 */
export type MatrixTechniqueCell = {
  id: string;
  externalId: string;
  name: BilingualText;
  /** 子技术数量，用于显示可展开标记。 */
  subtechniqueCount: number;
};

/** 技术列表行。 */
export type TechniqueListItem = {
  id: string;
  externalId: string;
  name: BilingualText;
  /** 所属第一个战术的 shortname（列表副标题用）。 */
  tacticShortname: string;
  isSubtechnique: boolean;
  isBookmarked: boolean;
};

/** 技术关联的数据组件展示项。 */
export type TechniqueDataComponentItem = {
  componentName: string;
  dataSourceId: string | null;
  dataSourceName: string | null;
};

/** 外部引用展示项。 */
export type TechniqueReferenceItem = {
  sourceName: string;
  url: string | null;
  description: string | null;
  externalId: string | null;
};

/** 攻击过程示例（Procedure Example）— 某组织/软件使用该技术的一次具体描述。 */
export type ProcedureExample = {
  kind: Extract<EntityKind, 'group' | 'software' | 'campaign'>;
  externalId: string;
  name: BilingualText;
  description: string;
};

/** 技术详情页数据 — 完整还原 MITRE ATT&CK 官网全部信息区块。 */
export type TechniqueDetailViewData = {
  id: string;
  externalId: string;
  name: BilingualText;
  description: BilingualText;
  detection: BilingualText | null;
  platforms: string[];
  revoked: boolean;
  deprecated: boolean;
  /** 所属战术（可能多个）。 */
  tactics: {externalId: string; name: BilingualText}[];
  /** 父技术；主技术为 null。 */
  parent: {externalId: string; name: BilingualText} | null;
  /** 子技术列表（按编号排序）。 */
  subtechniques: {externalId: string; name: BilingualText}[];
  /** 使用该技术的组织、软件与战役 — 仅展示简要引用卡片。 */
  usedBy: {
    kind: Extract<EntityKind, 'group' | 'software' | 'campaign'>;
    externalId: string;
    name: BilingualText;
  }[];
  /** 攻击过程示例（Procedure Examples）— 每个使用方含具体描述文本。 */
  procedureExamples: ProcedureExample[];
  /** 关联的缓解措施（经 mitigates 关系反查）。 */
  mitigations: {externalId: string; name: BilingualText}[];
  /** 关联数据组件（Data Sources）。 */
  dataComponents: TechniqueDataComponentItem[];
  /** 检测策略详情（Detection Strategies）。 */
  detectionStrategies: DetectionStrategy[];
  /** 版本号（如 2.7）。 */
  version: string | null;
  /** 创建时间 ISO 字符串。 */
  created: string | null;
  /** 最后修改时间 ISO 字符串。 */
  modified: string | null;
  /** 贡献者名单。 */
  contributors: string[];
  /** 是否支持远程执行。 */
  remoteSupport: boolean | null;
  /** 影响类型。 */
  impactType: string[];
  /** CAPEC 交叉编号。 */
  capecIds: string[];
  /** 外部引用列表（References）。 */
  references: TechniqueReferenceItem[];
  isBookmarked: boolean;
};

/** 搜索命中项。 */
export type SearchHit = {
  kind: EntityKind;
  id: string;
  externalId: string;
  name: BilingualText;
  /** 命中技术所属战术 shortname；其他实体为 null。 */
  tacticShortname: string | null;
  /** 相关性得分，降序排列。 */
  score: number;
};

/** 书签页行数据。 */
export type BookmarkItem = {
  id: string;
  externalId: string;
  name: BilingualText;
  tacticShortname: string | null;
};

/** 依据 locale 从双语字段取值的纯函数。 */
export const pickLocaleText = (text: BilingualText, locale: Locale): string => text[locale];
