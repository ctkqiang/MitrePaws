/**
 * 数据集清单 — 由 scripts/ingest-stix.mjs 生成，禁止手改。
 */

import raw from './json/manifest.json';

/** 种子清单类型：记录 ATT&CK 发行信息与各表计数。 */
export type SeedManifest = {
  /** ATT&CK 发行名称。 */
  attackRelease: string;
  /** 官方包修改时间（ISO）。 */
  version: string;
  /** 领域标识。 */
  domain: string;
  /** 摄取日期（YYYY-MM-DD）。 */
  generatedAt: string;
  /** 各实体表计数。 */
  counts: {
    tactics: number;
    techniques: number;
    groups: number;
    software: number;
    mitigations: number;
    campaigns: number;
    dataSources: number;
    dataComponents: number;
    relationships: number;
  };
  /** 种子格式版本。 */
  schemaVersion: number;
};

/** 全量数据集清单。 */
export const SEED_MANIFEST: SeedManifest = raw as SeedManifest;
