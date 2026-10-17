/**
 * 详情分节 — 豆包式卡片容器：纯白大圆角卡 + 左侧 4px 强调条小标题。
 *
 * 详情页各信息区块（概述 / 检测 / 平台 / 关系）的统一骨架。
 * 层级完全交给「页面底色 vs 白卡」的明度差与强调条表达，
 * 不依赖投影——豆包式设计靠克制的分区而非阴影堆叠。
 * hero 卡仅在深色主题下抬升底色、浅色主题下附一层极轻投影，
 * 让概述区块在不喧宾夺主的前提下成为视觉入口。
 */

import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/hooks/use-theme';
import { Gradients, Radius, Spacing } from '@/theme/tokens';

/** 详情分节属性。 */
export type DetailSectionProps = {
  /** 分节标题。 */
  title: string;
  /** 分节内容。 */
  children: ReactNode;
  /** 是否为 Hero 卡（概述）：深色主题下底色抬升，浅色主题下附极轻投影。 */
  hero?: boolean;
};

/**
 * 详情分节。
 *
 * @param props - 见 {@link DetailSectionProps}。
 */
export function DetailSection({ title, children, hero = false }: DetailSectionProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: hero ? theme.surfaceElevated : theme.backgroundElement,
          borderColor: theme.border,
        },
        hero ? { shadowColor: theme.shadow } : null,
        hero ? styles.heroShadow : null,
      ]}>
      <View style={styles.titleRow}>
        <LinearGradient
          colors={[...Gradients.brand]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.titleBar}
        />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  // hero 投影刻意压到「几乎不可见」：仅在与纯色底相接时提供一丝悬浮感。
  heroShadow: Platform.select<ViewStyle>({
    ios: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12 },
    android: { elevation: 1 },
    default: { boxShadow: '0 4px 12px rgba(23, 30, 55, 0.06)' } as ViewStyle,
  }),
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two + 2,
  },
  titleBar: {
    width: 4,
    height: 16,
    borderRadius: Radius.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
