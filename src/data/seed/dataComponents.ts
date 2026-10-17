/**
 * 数据组件种子数据 — 由 scripts/ingest-stix.mjs 从官方 STIX 2.1 生成，禁止手改。
 */

import raw from './json/dataComponents.json';

import type { DataComponent } from '@/types/stix';

/** 全量 ATT&CK Enterprise 数据组件。 */
export const SEED_DATA_COMPONENTS: DataComponent[] = raw as DataComponent[];
