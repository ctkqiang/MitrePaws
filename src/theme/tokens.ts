/**
 * 设计令牌 — 全项目唯一视觉取值来源。
 *
 * 豆包式设计语言：浅色主题为暖灰白底 + 纯白卡片 + 豆包蓝强调色，
 * 深色主题为深空灰蓝底 + 抬升卡片 + 亮蓝强调色，整体克制、
 * 专业、层级清晰。正文语义色（text / textSecondary）在双主题下
 * 与背景的对比度均不低于 4.5:1（WCAG AA）。
 * 模板兼容键（text / background / backgroundElement /
 * backgroundSelected / textSecondary）与语义键并存，
 * 保证既有模板组件原样编译。
 */

import '@/global.css';

import { Platform } from 'react-native';

/** 单一主题下的语义色表形状。 */
type Palette = {
  /** 正文主色。 */
  text: string;
  /** 次级文本色，与背景对比度 ≥ 4.5:1。 */
  textSecondary: string;
  /** 页面底色。 */
  background: string;
  /** 内容块 / 卡片底色（模板兼容键）。 */
  backgroundElement: string;
  /** 选中态底色（模板兼容键）。 */
  backgroundSelected: string;
  /** 平面容器色。 */
  surface: string;
  /** 抬升容器色（弹层、悬浮卡片）。 */
  surfaceElevated: string;
  /** 分隔线与描边色。 */
  border: string;
  /** 品牌强调色（樱花粉彩系）。 */
  accent: string;
  /** accent 的柔和衬底色，用于徽章与选中底。 */
  accentSoft: string;
  /** 企业领域专属强调色（默认与 accent 一致）。 */
  accentEnterprise: string;
  /** 移动领域专属强调色（薰衣草紫）。 */
  accentMobile: string;
  /** ICS 领域专属强调色（宝宝蓝）。 */
  accentIcs: string;
  /** 位于 accent 填充之上的前景色。 */
  onAccent: string;
  /** 位于任意饱和色填充（accent/danger/warning 徽标）之上的前景色。 */
  onColor: string;
  /** 悬浮玻璃容器的半透明底色 — 低透明度让内容色透上来，真·玻璃感。 */
  surfaceGlass: string;
  /** 底部标签栏专用底色 — 对齐系统标签栏材料色（iOS: #F9F9F9 / #1C1C1E），保证与操作系统 chrome 一致。 */
  surfaceTabBar: string;
  /** 柔和投影色（含透明度，iOS/Android 阴影共用）。 */
  shadow: string;
  /** 成功态。 */
  success: string;
  /** 警告态。 */
  warning: string;
  /** 危险 / 错误态。 */
  danger: string;
  /** Kawaii 粉 — 甜美樱花粉。 */
  kawaiiPink: string;
  /** Kawaii 薰衣草紫 — 梦幻淡紫。 */
  kawaiiLavender: string;
  /** Kawaii 薄荷绿 — 清新薄荷。 */
  kawaiiMint: string;
  /** Kawaii 蜜桃橙 — 温柔桃色。 */
  kawaiiPeach: string;
  /** Kawaii 天空蓝 — 清澈天蓝。 */
  kawaiiSky: string;
  /** Kawaii 奶油黄 — 温暖奶油。 */
  kawaiiCream: string;
};

/** 浅色主题：暖灰白底 + 纯白卡片 + 豆包蓝点缀。 */
const LIGHT: Palette = {
  text: '#1B1F27',
  textSecondary: '#667085',
  background: '#F5F6F8',
  backgroundElement: '#FFFFFF',
  backgroundSelected: '#EAF0FE',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E8EAEE',
  accent: '#3E6FF3',
  accentSoft: '#EAF0FE',
  accentEnterprise: '#3E6FF3',
  accentMobile: '#0EA5A4',
  accentIcs: '#E8930C',
  onAccent: '#FFFFFF',
  onColor: '#FFFFFF',
  surfaceGlass: 'rgba(255, 255, 255, 0.72)',
  surfaceTabBar: '#F9F9F9',
  shadow: 'rgba(23, 30, 55, 0.08)',
  success: '#1F9D6B',
  warning: '#E8930C',
  danger: '#E5484D',
  // Kawaii 扩展色板 — 重定义为豆包式的柔和伴侣色
  kawaiiPink: '#F2C4CE',
  kawaiiLavender: '#B9C6F2',
  kawaiiMint: '#9FD8C2',
  kawaiiPeach: '#F5D0BC',
  kawaiiSky: '#A9CDF2',
  kawaiiCream: '#F2EFE8',
};

/** 深色主题：深空灰蓝底 + 抬升卡片 + 亮蓝点缀，信息层级在暗处依然清晰。 */
const DARK: Palette = {
  text: '#ECEEF2',
  textSecondary: '#98A1B0',
  background: '#101216',
  backgroundElement: '#1A1D23',
  backgroundSelected: '#232C45',
  surface: '#1A1D23',
  surfaceElevated: '#232833',
  border: '#2A2F3A',
  accent: '#7AA0F8',
  accentSoft: '#24304F',
  accentEnterprise: '#7AA0F8',
  accentMobile: '#3FC9B4',
  accentIcs: '#F2A25C',
  onAccent: '#0D1424',
  onColor: '#0D1424',
  surfaceGlass: 'rgba(16, 18, 22, 0.68)',
  surfaceTabBar: '#1C1C1E',
  shadow: 'rgba(0, 0, 0, 0.55)',
  success: '#66D2A6',
  warning: '#F2C078',
  danger: '#F27979',
  // Kawaii 扩展色板 — 深色模式下降低饱和保持柔和
  kawaiiPink: '#B98A98',
  kawaiiLavender: '#8B98C4',
  kawaiiMint: '#7FB29C',
  kawaiiPeach: '#C4A894',
  kawaiiSky: '#8FA8C9',
  kawaiiCream: '#B0AB9E',
};

/** 双主题语义色表；light 与 dark 键位完全一致。 */
export const Colors = { light: LIGHT, dark: DARK } as const;

/**
 * 字节系品牌渐变 — 抖音标志性的红蓝对撞与青色霓虹。
 *
 * 仅用于 Hero 主视觉与强调位装饰（徽章点、选中指示条），
 * 功能语义色仍取 Colors.accent，两者不混用；
 * 渐变卡内部文字固定用白色，因为渐变底在双主题下都是深色底。
 */
export const Gradients = {
  /** 抖音红 → 品牌蓝：选中指示条与 CTA 强调。 */
  brand: ['#FE2C55', '#3E6FF3'] as const,
  /** 青色霓虹 → 品牌蓝：徽章点缀与数据强调。 */
  neon: ['#25F4EE', '#3E6FF3'] as const,
  /** 深空底 → 品牌蓝：Hero 卡片底色（双主题共用同一深色底）。 */
  hero: ['#131A2C', '#1E3A8A'] as const,
} as const;

/** 抖音红原始值 — 色差光晕等装饰场景直接取用。 */
export const DOUYIN_RED = '#FE2C55' as const;

/** 抖音青原始值 — 色差光晕等装饰场景直接取用。 */
export const DOUYIN_CYAN = '#25F4EE' as const;

/** 双主题共有的语义色键，用于主题化组件的颜色取值。 */
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** 跨平台字体族映射；Web 端走 global.css 注入的字体变量。 */
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** 4pt 网格间距刻度；half 保留给 2pt 细线 / 紧凑间距场景。 */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** 圆角刻度：sm 8 / md 14 / lg 20 / pill 999。 */
export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

/** 底部标签栏内容内缩量（按平台校准）。 */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

/** 宽屏场景下的内容最大宽度。 */
export const MaxContentWidth = 800;
