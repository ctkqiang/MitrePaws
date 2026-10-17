/**
 * 战术过滤小胶囊 — 选中态使用 accent 填充，按压有轻微弹簧反馈。
 */

import { StyleSheet, Text } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme/tokens';

/** 战术过滤小胶囊属性。 */
export type TacticChipProps = {
  /** 战术 shortname，如 persistence。 */
  shortname: string;
  /** 显示名称（已按当前语言取值）。 */
  name: string;
  /** 是否选中。 */
  selected: boolean;
  /** 点击回调。 */
  onPress: () => void;
};

/**
 * 战术过滤小胶囊。
 *
 * @param props - 见 {@link TacticChipProps}。
 */
export function TacticChip({ name, selected, onPress }: TacticChipProps) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      activeScale={0.93}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.accent : theme.surface,
          borderColor: selected ? theme.accent : theme.border,
        },
      ]}>
      <Text style={[styles.text, { color: selected ? theme.onAccent : theme.text }]}>{name}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two - 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
