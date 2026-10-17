/**
 * 战役种子数据 — 由 scripts/ingest-stix.mjs 从官方 STIX 2.1 生成，禁止手改。
 */

import raw from './json/campaigns.json';

import type { Campaign } from '@/types/stix';

/** 全量 ATT&CK Enterprise 战役。 */
export const SEED_CAMPAIGNS: Campaign[] = raw as Campaign[];
