/**
 * 空态 — 垂直居中显示图标、标题与说明；图标由调用方以 SVG 节点注入。
 */

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PawIcon } from '@/components/icons/PawIcon';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

/** 空态属性。 */
export type EmptyStateProps = {
  /** 标题。 */
  title: string;
  /** 说明文案。 */
  message: string;
  /** 自定义 SVG 图标节点；缺省为品牌肉爪。 */
  icon?: ReactNode;
};

/**
 * 空态。
 *
 * @param props - 见 {@link EmptyStateProps}。
 */
export function EmptyState({ title, message, icon }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: theme.accentSoft }]}>
        {icon ?? <PawIcon size={38} color={theme.accent} />}
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
