/**
 * 底部标签栏 — 抖音式悬浮胶囊条。
 *
 * 全平台 absolute 悬浮于内容之上：外层容器透明且 pointerEvents="box-none"，
 * 悬浮条两侧与下方空隙不拦截滚动触摸；内层 pill 承载 90% 不透明底色、
 * hairline 描边与柔和投影，内容滚动时可从条下穿过。
 * TabList asChild 的 Slot 会向外层注入 flexDirection: 'row'，
 * 必须显式恢复 column，否则 bar 被压扁到左侧。
 */

import type { TabListProps } from 'expo-router/ui';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { POP_SPRING } from '@/theme/motion';
import { Spacing } from '@/theme/tokens';

/** 悬浮条水平外边距。 */
const DOCK_HORIZONTAL_INSET = Spacing.three;
/** 悬浮条圆角。 */
const DOCK_RADIUS = 26;
/** 内容区需要避让的悬浮条总高（条高 + 底部浮距）。 */
export const FLOATING_DOCK_CLEARANCE = 76;

/**
 * 底部标签栏。
 *
 * @param props - 透传自 TabList asChild 的视图属性，children 为各 TabBarButton。
 */
export function TabBar({ children, style, ...props }: TabListProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const entrance = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      entrance.value = 1;
      return;
    }
    entrance.value = withSpring(1, POP_SPRING);
  }, [entrance, reducedMotion]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 28 }],
  }));

  return (
    <View
      {...props}
      pointerEvents="box-none"
      style={[
        style,
        styles.dock,
        {
          paddingHorizontal: DOCK_HORIZONTAL_INSET,
          paddingBottom: Platform.OS === 'web' ? Spacing.two : insets.bottom + Spacing.one,
        },
      ]}>
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: `${theme.surfaceTabBar}E6`,
            borderColor: theme.border,
          },
          reducedMotion ? undefined : entranceStyle,
        ]}>
        <View style={styles.row}>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    // TabList 通过 Slot 注入 flexDirection: 'row'，显式恢复纵向防止 bar 被压扁到左侧。
    flexDirection: 'column',
  },
  pill: {
    borderRadius: DOCK_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
    paddingHorizontal: Spacing.one,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.14,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 14 },
      web: { boxShadow: '0 6px 24px rgba(15, 18, 28, 0.16)' },
      default: {},
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
