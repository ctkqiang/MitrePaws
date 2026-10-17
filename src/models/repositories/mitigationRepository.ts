/**
 * 缓解措施仓储 — 缓解措施种子的只读访问。
 */

import { SEED_MITIGATIONS } from '@/data/seed';
import type { Mitigation } from '@/types/stix';

/**
 * 返回全部缓解措施，按外部编号升序。
 *
 * @returns {Mitigation[]} 缓解措施列表。
 */
export const all = (): Mitigation[] =>
  [...SEED_MITIGATIONS].sort((a, b) => a.externalId.localeCompare(b.externalId));

/**
 * 按 id（外部编号）查找缓解措施。
 *
 * @param {string} id - 缓解措施外部编号，如 M1041。
 * @returns {Mitigation | null} 命中返回条目，否则返回 null。
 */
export const byId = (id: string): Mitigation | null => SEED_MITIGATIONS.find((m) => m.id === id) ?? null;
