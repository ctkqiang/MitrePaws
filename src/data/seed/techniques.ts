/**
 * 技术种子数据 — 由 scripts/ingest-stix.mjs 从官方 STIX 2.1 生成，禁止手改。
 */

import raw from './json/techniques.json';

import type { Technique } from '@/types/stix';

/** 全量 ATT&CK Enterprise 技术与子技术。 */
export const SEED_TECHNIQUES: Technique[] = raw as Technique[];
