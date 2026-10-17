/**
 * 关系仓储 — 关系种子的只读访问。
 */

import { SEED_RELATIONSHIPS } from '@/data/seed';
import type { Relationship, RelationshipType } from '@/types/stix';

/**
 * 返回全部关系。
 *
 * @returns {Relationship[]} 关系列表。
 */
export const all = (): Relationship[] => SEED_RELATIONSHIPS;

/**
 * 按源实体 id 过滤关系。
 *
 * @param {string} sourceId - 源实体 id。
 * @returns {Relationship[]} 源端匹配的关系。
 */
export const bySource = (sourceId: string): Relationship[] =>
  SEED_RELATIONSHIPS.filter((r) => r.sourceId === sourceId);

/**
 * 按目标实体 id 过滤关系。
 *
 * @param {string} targetId - 目标实体 id。
 * @returns {Relationship[]} 目标端匹配的关系。
 */
export const byTarget = (targetId: string): Relationship[] =>
  SEED_RELATIONSHIPS.filter((r) => r.targetId === targetId);

/**
 * 按关系类型与目标 id 过滤关系。
 *
 * @param {RelationshipType} type - 关系类型。
 * @param {string} targetId - 目标实体 id。
 * @returns {Relationship[]} 类型与目标均匹配的关系。
 */
export const byTypeAndTarget = (type: RelationshipType, targetId: string): Relationship[] =>
  SEED_RELATIONSHIPS.filter((r) => r.type === type && r.targetId === targetId);
