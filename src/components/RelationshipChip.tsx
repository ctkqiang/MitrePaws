/**
 * 关系小胶囊 — 显示外部编号与名称，背景 accentSoft；kind 决定文字色。
 */

import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme/tokens';
import type { BilingualText as BilingualTextValue, EntityKind } from '@/types/stix';
import { BilingualText } from './BilingualText';

/** 关系小胶囊属性。 */
export type RelationshipChipProps = {
  /** 外部编号。 */
  externalId: string;
  /** 双语名称。 */
  name: BilingualTextValue;
  /** 实体种类，决定编号文字色；mitigation 使用中性色。 */
  kind: EntityKind | 'mitigation';
  /** 可选点击回调。 */
  onPress?: () => void;
};

export function RelationshipChip({ externalId, name, kind, onPress }: RelationshipChipProps) {
  const theme = useTheme();

  const idColor =
    kind === 'tactic'
      ? theme.success
      : kind === 'technique'
        ? theme.accent
        : kind === 'group'
          ? theme.warning
          : kind === 'software'
            ? theme.danger
            : theme.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={onPress === undefined}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: theme.accentSoft },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.id, { color: idColor }]}>{externalId}</Text>
      <BilingualText
        text={name}
        style={[styles.name, { color: theme.text }]}
        numberOfLines={1}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  id: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  name: {
    fontSize: 13,
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
