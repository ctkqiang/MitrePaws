/**
 * 主题兼容层 — 仅从 '@/theme/tokens' 转发设计令牌。
 *
 * 模板组件继续从本路径导入 Colors / Fonts / Spacing 等符号；
 * 新代码请直接引用 '@/theme/tokens'。
 */

export { BottomTabInset, Colors, Fonts, MaxContentWidth, Radius, Spacing } from '@/theme/tokens';
export type { ThemeColor } from '@/theme/tokens';
