/**
 * 种子数据汇总出口 — 仓储层从这里取全部静态内容。
 *
 * 全部 JSON 由 scripts/ingest-stix.mjs 从官方 STIX 2.1 生成。
 */

export { SEED_CAMPAIGNS } from './campaigns';
export { SEED_DATA_COMPONENTS } from './dataComponents';
export { SEED_DATA_SOURCES } from './dataSources';
export { SEED_GROUPS } from './groups';
export { SEED_MANIFEST } from './manifest';
export type { SeedManifest } from './manifest';
export { SEED_MITIGATIONS } from './mitigations';
export { SEED_RELATIONSHIPS } from './relationships';
export { SEED_SOFTWARE } from './software';
export { SEED_TACTICS } from './tactics';
export { SEED_TECHNIQUES } from './techniques';

