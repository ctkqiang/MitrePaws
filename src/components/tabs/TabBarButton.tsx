/**
 * 底部标签按钮 — 无背景、无边框，选中态 = 颜色变化 + 品牌渐变霓虹指示条。
 * 按压有轻微透明度反馈，无动画延迟（不引入 Reanimated，点击即时响应）。
 */

import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/services/haptics';
import { Gradients } from '@/theme/tokens';
import type { TabItem } from './tabItems';

/** 标签按钮属性。 */
export type TabBarButtonProps = {
  /** 标签静态描述。 */
  item: TabItem;
  /** 是否选中（由 TabTrigger asChild 注入）。 */
  isFocused?: boolean;
  /** 点击回调（由 TabTrigger asChild 注入）。 */
  onPress?: () => void;
  /** 长按回调（由 TabTrigger asChild 注入）。 */
  onLongPress?: () => void;
  /** 显示文字（由父级注入，因为涉及 i18n）。 */
  label: string;
};

/**
 * 底部标签按钮。
 *
 * @param props - 见 {@link TabBarButtonProps}。
 */
export function TabBarButton({
  item,
  isFocused = false,
  onPress,
  onLongPress,
  label,
}: TabBarButtonProps) {
  const theme = useTheme();
  const Icon = item.Icon;

  const handlePress = () => {
    haptics.selection();
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
      ]}>
      <View style={styles.content}>
        <Icon
          size={24}
          color={isFocused ? theme.accent : theme.textSecondary}
        />
        <Text
          style={[
            styles.label,
            { color: isFocused ? theme.accent : theme.textSecondary },
          ]}>
          {label}
        </Text>
        {isFocused && (
          <LinearGradient
            colors={[...Gradients.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.indicator}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  pressed: {
    opacity: 0.6,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  indicator: {
    width: 16,
    height: 3,
    borderRadius: 999,
    marginTop: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
