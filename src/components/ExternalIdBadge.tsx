/**
 * 外部编号徽标 — 按 ATT&CK 编号前缀映射语义色：T→accent / TA→success /
 * G→warning / S→danger / M→textSecondary；圆角胶囊。
 */

import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme/tokens';
import type { EntityKind } from '@/types/stix';

/** 徽标属性。 */
export type ExternalIdBadgeProps = {
  /** 外部编号，如 T1059 / TA0002 / G0007。 */
  value: string;
  /** 可选实体种类；当前仅用于语义标注，不影响取色。 */
  kind?: EntityKind;
};

export function ExternalIdBadge({ value }: ExternalIdBadgeProps) {
  const theme = useTheme();

  const backgroundColor = value.startsWith('TA')
    ? theme.success
    : value.startsWith('T')
      ? theme.accent
      : value.startsWith('G')
        ? theme.warning
        : value.startsWith('S')
          ? theme.danger
          : theme.textSecondary;

  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <Text style={[styles.text, { color: theme.onColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
