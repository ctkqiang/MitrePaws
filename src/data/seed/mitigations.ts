/**
 * 缓解措施种子数据 — 由 scripts/ingest-stix.mjs 从官方 STIX 2.1 生成，禁止手改。
 */

import raw from './json/mitigations.json';

import type { Mitigation } from '@/types/stix';

/** 全量 ATT&CK Enterprise 缓解措施。 */
export const SEED_MITIGATIONS: Mitigation[] = raw as Mitigation[];
