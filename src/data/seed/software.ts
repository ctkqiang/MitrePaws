/**
 * 软件种子数据 — 由 scripts/ingest-stix.mjs 从官方 STIX 2.1 生成，禁止手改。
 */

import raw from './json/software.json';

import type { Software } from '@/types/stix';

/** 全量 ATT&CK Enterprise 软件（malware + tool）。 */
export const SEED_SOFTWARE: Software[] = raw as Software[];
