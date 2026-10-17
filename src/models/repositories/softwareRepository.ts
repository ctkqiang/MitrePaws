/**
 * 软件仓储 — 软件种子的只读访问。
 */

import { SEED_SOFTWARE } from '@/data/seed';
import type { Software } from '@/types/stix';

/**
 * 返回全部软件条目，按外部编号升序。
 *
 * @returns {Software[]} 软件列表。
 */
export const all = (): Software[] => [...SEED_SOFTWARE].sort((a, b) => a.externalId.localeCompare(b.externalId));

/**
 * 按 id（外部编号）查找软件。
 *
 * @param {string} id - 软件外部编号，如 S0154。
 * @returns {Software | null} 命中返回软件，否则返回 null。
 */
export const byId = (id: string): Software | null => SEED_SOFTWARE.find((s) => s.id === id) ?? null;
