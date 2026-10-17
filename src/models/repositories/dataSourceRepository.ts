/**
 * 数据源仓储 — 数据源的只读访问。
 *
 * 全部纯函数；数据来自官方 STIX 摄取的种子。
 */

import { SEED_DATA_SOURCES } from '@/data/seed';
import type { DataSource } from '@/types/stix';

/** 按外部编号升序比较。 */
const byExternalId = (a: { externalId: string }, b: { externalId: string }): number =>
  a.externalId.localeCompare(b.externalId);

/**
 * 返回全部数据源，按外部编号升序。
 *
 * @returns {DataSource[]} 数据源列表。
 */
export const all = (): DataSource[] => [...SEED_DATA_SOURCES].sort(byExternalId);

/**
 * 按 id（外部编号）查找数据源。
 *
 * @param {string} id - 数据源外部编号，如 DS0017。
 * @returns {DataSource | null} 命中返回数据源，否则返回 null。
 */
export const byId = (id: string): DataSource | null =>
  SEED_DATA_SOURCES.find((ds) => ds.id === id) ?? null;
