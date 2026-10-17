/**
 * 战术仓储 — 战术种子的只读访问，全部为纯函数。
 */

import { SEED_TACTICS } from '@/data/seed';
import type { Tactic } from '@/types/stix';

/**
 * 返回全部战术，按矩阵列序升序。
 *
 * @returns {Tactic[]} 战术列表。
 */
export const all = (): Tactic[] => [...SEED_TACTICS].sort((a, b) => a.ordinal - b.ordinal);

/**
 * 按 id（外部编号）查找战术。
 *
 * @param {string} id - 战术外部编号，如 TA0002。
 * @returns {Tactic | null} 命中返回战术，否则返回 null。
 */
export const byId = (id: string): Tactic | null => SEED_TACTICS.find((t) => t.id === id) ?? null;
