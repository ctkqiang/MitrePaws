/**
 * 屏幕脚手架 — SafeAreaView + 主题背景色 + 统一内边距，可选滚动容器。
 *
 * 顶部吃安全区并留出呼吸间距；底部导航为全平台 absolute 悬浮胶囊条，
 * 这里统一追加底部留白防止最后一屏内容停在悬浮条下面。
 */

import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_DOCK_CLEARANCE } from '@/components/tabs/TabBar';
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
  const insets = useSafeAreaInsets();
  const dockInset: ViewStyle = {
    paddingBottom: FLOATING_DOCK_CLEARANCE + insets.bottom,
  };

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, dockInset, style]}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.content, dockInset, style]}>{children}</View>
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
