/**
 * 战术种子数据 — 由 scripts/ingest-stix.mjs 从官方 STIX 2.1 生成，禁止手改。
 */

import raw from './json/tactics.json';

import type { Tactic } from '@/types/stix';

/** 全量 ATT&CK Enterprise 战术（按矩阵列序）。 */
export const SEED_TACTICS: Tactic[] = raw as Tactic[];
