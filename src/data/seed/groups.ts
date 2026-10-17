/**
 * 组织种子数据 — 由 scripts/ingest-stix.mjs 从官方 STIX 2.1 生成，禁止手改。
 */

import raw from './json/groups.json';

import type { Group } from '@/types/stix';

/** 全量 ATT&CK Enterprise 威胁组织。 */
export const SEED_GROUPS: Group[] = raw as Group[];
