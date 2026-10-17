/**
 * 数据源种子数据 — 由 scripts/ingest-stix.mjs 从官方 STIX 2.1 生成，禁止手改。
 */

import raw from './json/dataSources.json';

import type { DataSource } from '@/types/stix';

/** 全量 ATT&CK Enterprise 数据源。 */
export const SEED_DATA_SOURCES: DataSource[] = raw as DataSource[];
