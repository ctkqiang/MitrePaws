/**
 * 底部标签栏 Web 入口 — 与原生共用 tabs/AppTabs 实现。
 *
 * Web 特有的 backdrop-filter 模糊与 env(safe-area-inset-bottom)
 * 已在共享实现中通过 global.css 类名处理。
 */

export { default } from './tabs/AppTabs';
