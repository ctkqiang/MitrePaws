/**
 * 威胁组织仓储 — 组织种子的只读访问。
 */

import { SEED_GROUPS } from '@/data/seed';
import type { Group } from '@/types/stix';

/**
 * 返回全部威胁组织，按外部编号升序。
 *
 * @returns {Group[]} 组织列表。
 */
export const all = (): Group[] => [...SEED_GROUPS].sort((a, b) => a.externalId.localeCompare(b.externalId));

/**
 * 按 id（外部编号）查找组织。
 *
 * @param {string} id - 组织外部编号，如 G0007。
 * @returns {Group | null} 命中返回组织，否则返回 null。
 */
export const byId = (id: string): Group | null => SEED_GROUPS.find((g) => g.id === id) ?? null;
