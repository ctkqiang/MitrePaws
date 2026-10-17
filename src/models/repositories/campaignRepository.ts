/**
 * 战役仓储 — 战役的只读访问。
 *
 * 全部纯函数；数据来自官方 STIX 摄取的种子。
 */

import { SEED_CAMPAIGNS } from '@/data/seed';
import type { Campaign } from '@/types/stix';

/** 按外部编号升序比较。 */
const byExternalId = (a: { externalId: string }, b: { externalId: string }): number =>
  a.externalId.localeCompare(b.externalId);

/**
 * 返回全部战役，按外部编号升序。
 *
 * @returns {Campaign[]} 战役列表。
 */
export const all = (): Campaign[] => [...SEED_CAMPAIGNS].sort(byExternalId);

/**
 * 按 id（外部编号）查找战役。
 *
 * @param {string} id - 战役外部编号，如 C0025。
 * @returns {Campaign | null} 命中返回战役，否则返回 null。
 */
export const byId = (id: string): Campaign | null =>
  SEED_CAMPAIGNS.find((c) => c.id === id) ?? null;
