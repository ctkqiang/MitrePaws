/**
 * 分节标题 — 左侧标题，可选数量徽标，可选右侧附加节点。
 */

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme/tokens';

/** 分节标题属性。 */
export type SectionHeaderProps = {
  /** 标题文案。 */
  title: string;
  /** 可选数量，渲染为小胶囊。 */
  count?: number;
  /** 可选右侧附加节点。 */
  badge?: ReactNode;
};

export function SectionHeader({ title, count, badge }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {count !== undefined && (
        <View style={[styles.countPill, { backgroundColor: theme.accentSoft }]}>
          <Text style={[styles.countText, { color: theme.accent }]}>{count}</Text>
        </View>
      )}
      {badge !== undefined && <View style={styles.badge}>{badge}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  countPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    marginLeft: 'auto',
  },
});
