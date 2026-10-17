/**
 * 底部标签栏 — 对齐系统标签栏的材料色。
 *
 * 背景必须挂在外层 dock 而非内层 bar：原生端安全区 insets.bottom
 * 是 dock 的 padding，若背景只给 bar，Home 指示条区域会透明漏内容，
 * 与系统导航区形成色差。底色取 surfaceTabBar（iOS 原生 #F9F9F9 / #1C1C1E），
 * 保证与操作系统 chrome 视觉一致。
 */

import type { TabListProps } from 'expo-router/ui';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

/**
 * 底部标签栏。
 *
 * @param props - 透传自 TabList asChild 的视图属性，children 为各 TabBarButton。
 */
export function TabBar({ children, style, ...props }: TabListProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      {...props}
      style={[
        style,
        styles.dock,
        {
          backgroundColor: theme.surfaceTabBar,
          borderTopColor: theme.border,
        },
        Platform.OS !== 'web'
          ? { paddingBottom: insets.bottom }
          : styles.webDock,
      ]}>
      <View style={[styles.bar, { borderTopColor: theme.border }]}>
        <View style={styles.row}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    width: '100%',
    // TabList 通过 Slot 注入 flexDirection: 'row'，显式恢复纵向防止 bar 被压扁到左侧。
    flexDirection: 'column',
  },
  webDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
});
