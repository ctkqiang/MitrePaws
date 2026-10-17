/**
 * 关系种子数据 — 由 scripts/ingest-stix.mjs 从官方 STIX 2.1 生成，禁止手改。
 */

import raw from './json/relationships.json';

import type { Relationship } from '@/types/stix';

/** 全量 ATT&CK Enterprise 关系边（uses / mitigates → 技术）。 */
export const SEED_RELATIONSHIPS: Relationship[] = raw as Relationship[];
