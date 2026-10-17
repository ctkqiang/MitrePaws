/**
 * STIX / ATT&CK 领域类型契约 — 全项目的类型基石。
 *
 * 所有实体均为摄取管道产出的"规范形状"：双语字段成对出现，
 * 外部编号（Txxxx/Gxxxx/Sxxxx/TAxxxx）是持久关联键。
 * 未来接入 WatermelonDB 时，仓储层返回值必须与本文件形状一致。
 */

/** 应用支持的界面与内容语言。 */
export type Locale = 'en' | 'zh';

/** ATT&CK 领域（当前种子仅覆盖 Enterprise）。 */
export type AttackDomain = 'enterprise-attack';

/** 可检索实体的种类。 */
export type EntityKind =
  | 'tactic'
  | 'technique'
  | 'group'
  | 'software'
  | 'campaign'
  | 'dataSource';

/** 成对的双语文本。 */
export type BilingualText = {
  /** 英文原文。 */
  en: string;
  /** 简体中文译文（人工审校）。 */
  zh: string;
};

/** 战术（Tactic）。 */
export type Tactic = {
  /** 稳定主键（本种子内为外部编号）。 */
  id: string;
  /** ATT&CK 外部编号，如 TA0001。 */
  externalId: string;
  /** 矩阵列 shortname，如 persistence。 */
  shortname: string;
  /** 双语名称。 */
  name: BilingualText;
  /** 双语描述。 */
  description: BilingualText;
  /** 矩阵中的列序。 */
  ordinal: number;
};

/** 技术的外部引用条目（官网 References 区块的一行）。 */
export type TechniqueReference = {
  /** 来源名（如厂商报告标题）。 */
  sourceName: string;
  /** 原文链接；纯编号引用（如 CAPEC）时为 null。 */
  url: string | null;
  /** 引用描述（作者、日期、检索日期）。 */
  description: string | null;
  /** 外部编号（如 CAPEC-549）；无则为 null。 */
  externalId: string | null;
};

/** 技术关联的数据组件条目（官网 Data Sources 区块的一行）。 */
export type TechniqueDataComponent = {
  /** 数据组件名（如 Process Creation）。 */
  componentName: string;
  /** 所属数据源外部编号（如 DS0009）；未能解析时为 null。 */
  dataSourceId: string | null;
  /** 所属数据源名（如 Process）。 */
  dataSourceName: string | null;
};

/** 日志源引用（Analytic 中的具体监控点）。 */
export type AnalyticLogSource = {
  /** 日志源名称（双语；zh 由本地化合并阶段从受控术语表解析）。 */
  name: BilingualText;
  /** 监控通道说明。 */
  channel: string | null;
};

/** 检测分析（Detection Analytic）— 官网 Detection 区块中的具体分析项。 */
export type DetectionAnalytic = {
  /** Analytic 编号（STIX id，本地化文件以此为键）。 */
  id: string;
  /** 分析名称（双语）。 */
  name: BilingualText;
  /** 分析描述（双语；具体检测逻辑）。 */
  description: BilingualText;
  /** 适用平台。 */
  platforms: string[];
  /** 关联的日志源。 */
  logSources: AnalyticLogSource[];
};

/** 检测策略（Detection Strategy）— 官网 Detection 区块的策略级描述。 */
export type DetectionStrategy = {
  /** 策略编号（STIX id，本地化文件以此为键）。 */
  id: string;
  /** 策略名称（双语）。 */
  name: BilingualText;
  /** 策略描述（双语）。 */
  description: BilingualText;
  /** 该策略下的具体分析。 */
  analytics: DetectionAnalytic[];
};

/** 技术 / 子技术（Technique）。子技术通过 parentId 自引用。 */
export type Technique = {
  id: string;
  /** ATT&CK 外部编号，如 T1059 / T1059.004。 */
  externalId: string;
  /** 父技术 id；子技术必有，主技术为 null。 */
  parentId: string | null;
  /** 是否为子技术。 */
  isSubtechnique: boolean;
  name: BilingualText;
  description: BilingualText;
  /** 双语检测建议；源数据缺失时为 null。 */
  detection: BilingualText | null;
  /** 所属战术 id 列表（kill_chain_phases 物化结果）。 */
  tacticIds: string[];
  /** 适用平台（规范化字符串）。 */
  platforms: string[];
  /** 是否已被撤销（revoked）。 */
  revoked: boolean;
  /** 是否已废弃（deprecated）。 */
  deprecated: boolean;
  /** ATT&CK 对象版本号（如 2.7）。 */
  version: string | null;
  /** 创建时间（ISO 8601）。 */
  created: string | null;
  /** 最后修改时间（ISO 8601）。 */
  modified: string | null;
  /** 贡献者名单。 */
  contributors: string[];
  /** 是否支持远程执行；源数据未标注时为 null。 */
  remoteSupport: boolean | null;
  /** 影响类型（如 DoS、Data Encrypted for Impact）。 */
  impactType: string[];
  /** CAPEC 交叉编号列表。 */
  capecIds: string[];
  /** 外部引用列表（官网 References 区块）。 */
  references: TechniqueReference[];
  /** 关联数据组件列表（官网 Data Sources 区块）。 */
  dataComponents: TechniqueDataComponent[];
  /** 检测策略详情（官网 Detection 区块完整内容）。 */
  detectionStrategies: DetectionStrategy[];
};

/** 威胁组织（Group / intrusion-set）。 */
export type Group = {
  id: string;
  externalId: string;
  name: BilingualText;
  description: BilingualText;
  /** 已知别名。 */
  aliases: string[];
};

/** 软件（Software：malware / tool）。 */
export type Software = {
  id: string;
  externalId: string;
  /** 软件性质。 */
  kind: 'malware' | 'tool';
  name: BilingualText;
  description: BilingualText;
  platforms: string[];
};

/** 关系类型（种子覆盖的最小集）。 */
export type RelationshipType = 'uses' | 'mitigates';

/** 带类型的图边；双语描述用于攻击过程示例。 */
export type Relationship = {
  id: string;
  type: RelationshipType;
  /** 源实体 id（组织 / 软件 / 缓解措施侧）。 */
  sourceId: string;
  /** 目标实体 id（技术侧）。 */
  targetId: string;
  /** 双语说明（如 procedure example）；无则为 null。 */
  description: BilingualText | null;
};

/** 缓解措施（Mitigation / course-of-action）。 */
export type Mitigation = {
  id: string;
  externalId: string;
  name: BilingualText;
  description: BilingualText;
};

/** 战役（Campaign）。 */
export type Campaign = {
  id: string;
  externalId: string;
  name: BilingualText;
  description: BilingualText;
  /** 已知别名。 */
  aliases: string[];
  /** 首次活动时间（ISO 日期或 null）。 */
  firstSeen: string | null;
  /** 末次活动时间（ISO 日期或 null）。 */
  lastSeen: string | null;
};

/** 数据源（Data Source / x-mitre-data-source）。 */
export type DataSource = {
  id: string;
  externalId: string;
  name: BilingualText;
  description: BilingualText;
  /** 采集渠道（如网络流量、进程监控）。 */
  collectionLayers: string[];
};

/** 数据组件（Data Component / x-mitre-data-component）。 */
export type DataComponent = {
  id: string;
  name: BilingualText;
  description: BilingualText;
  /** 所属数据源 id。 */
  dataSourceId: string;
};

/** 实体在搜索 / 列表场景下的轻量引用。 */
export type EntityRef = {
  kind: EntityKind;
  id: string;
  externalId: string;
  name: BilingualText;
};
