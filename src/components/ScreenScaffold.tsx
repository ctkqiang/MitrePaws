/**
 * 屏幕脚手架 — SafeAreaView + 主题背景色 + 统一内边距，可选滚动容器。
 *
 * 顶部吃安全区并留出呼吸间距；原生端底栏处于文档流中由 flex 避让，
 * Web 端底栏为 absolute 悬浮胶囊，这里追加底部留白防止内容被玻璃条遮住。
 */

import type { PropsWithChildren } from 'react';
import { Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

/** 屏幕脚手架属性。 */
export type ScreenScaffoldProps = PropsWithChildren<{
  /** 为 true 时使用 ScrollView 包裹内容。 */
  scroll?: boolean;
  /** 追加到内容容器的样式。 */
  style?: ViewStyle;
}>;

/**
 * 屏幕脚手架。
 *
 * @param props - 见 {@link ScreenScaffoldProps}。
 */
export function ScreenScaffold({ children, scroll = false, style }: ScreenScaffoldProps) {
  const theme = useTheme();

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, webDockInset, style]}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.content, webDockInset, style]}>{children}</View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
});

/**
 * Web 端底栏是 absolute 悬浮胶囊（约 86px 高），
 * 屏幕滚动内容需额外留白，避免最后一屏内容停在玻璃条下面。
 */
const webDockInset: ViewStyle | null =
  Platform.OS === 'web' ? { paddingBottom: 96 } : null;
