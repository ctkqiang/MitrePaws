/**
 * 底部标签按钮 — 无背景、无边框，选中态 = 颜色变化 + 图标 pop 弹跳 +
 * 品牌渐变霓虹指示条弹簧展开。
 *
 * 按压有轻微透明度反馈，onPress 即时触发（动画全部跑在 UI 线程共享值上，
 * 不阻塞 JS 手势回调，保证零延迟）。减弱动态效果时退化为纯颜色切换。
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/services/haptics';
import { COLOR_TIMING, POP_SPRING } from '@/theme/motion';
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
  const reducedMotion = useReducedMotion();
  /** 图标弹跳进度：选中瞬间先缩后弹。 */
  const pop = useSharedValue(1);
  /** 指示条展开进度。 */
  const indicator = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      pop.value = 1;
      indicator.value = isFocused ? 1 : 0;
      return;
    }
    if (isFocused) {
      pop.value = 0.72;
      pop.value = withSpring(1, POP_SPRING);
    }
    indicator.value = withTiming(isFocused ? 1 : 0, COLOR_TIMING);
  }, [isFocused, reducedMotion, pop, indicator]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicator.value,
    transform: [{ scaleX: indicator.value }],
  }));

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
        <Animated.View style={reducedMotion ? undefined : iconStyle}>
          <Icon
            size={24}
            color={isFocused ? theme.accent : theme.textSecondary}
          />
        </Animated.View>
        <Text
          style={[
            styles.label,
            { color: isFocused ? theme.accent : theme.textSecondary },
          ]}>
          {label}
        </Text>
        <Animated.View style={[styles.indicatorTrack, reducedMotion ? undefined : indicatorStyle]}>
          {isFocused || !reducedMotion ? (
            <LinearGradient
              colors={[...Gradients.brand]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.indicator}
            />
          ) : null}
        </Animated.View>
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
  indicatorTrack: {
    height: 3,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: 16,
    height: 3,
    borderRadius: 999,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
