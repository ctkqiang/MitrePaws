/**
 * 主题解析钩子 — 把用户选择的主题模式（auto / light / dark）解析为
 * 实际生效的调色板。
 *
 * auto 模式跟随系统外观（useColorScheme），light / dark 强制覆盖。
 * 所有组件只通过本钩子取色，绝不直接读 useColorScheme。
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/stores/themeStore';

/**
 * 解析当前生效的主题调色板。
 *
 * @returns 当前主题的语义色表（Colors.light 或 Colors.dark）。
 */
export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const systemScheme = useColorScheme();

  const resolved = mode === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  return Colors[resolved];
}
