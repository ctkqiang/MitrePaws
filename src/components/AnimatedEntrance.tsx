/**
 * 入场动画容器 — 内容出现时「轻轻落下」。
 *
 * 常规动态：挂载后以共享值驱动 opacity + translateY 的短促弹簧；
 * 开启减弱动态效果时直接显示。
 *
 * 不用 Reanimated 的 `entering` 属性：其 Web 实现会在动画期间把节点
 * 临时设为 position: absolute，部分场景下动画结束后不复位，导致后续兄弟
 * 元素顶上来与标题重叠。改为手动挂载动画后，节点始终留在文档流中，
 * 三端表现一致（规范 §11.4：动画跑在 UI 线程 worklet，无 JS 循环）。
 * 只用于屏幕级标题 / 卡片块，绝不用在数百行的列表项上（帧率要求）。
 */

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { POP_SPRING } from '@/theme/motion';

/** 入场动画容器属性。 */
export type AnimatedEntranceProps = {
  /** 子内容。 */
  children: ReactNode;
  /** 入场延迟（毫秒），用于少量元素的错峰出现。 */
  delay?: number;
  /** 落下的纵向位移（px）。 */
  offset?: number;
  /** 初始缩放（如 0.96 表示从略小弹到 1），默认 0.96。 */
  scaleFrom?: number;
  /** 容器样式。 */
  style?: StyleProp<ViewStyle>;
};

/**
 * 入场动画容器。
 *
 * @param props - 见 {@link AnimatedEntranceProps}。
 */
export function AnimatedEntrance({
  children,
  delay = 0,
  offset = 18,
  scaleFrom = 0.96,
  style,
}: AnimatedEntranceProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = 1;
      return;
    }
    const timer = delay > 0 ? setTimeout(() => fire(), delay) : null;
    if (timer === null) {
      fire();
    }
    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
    };

    function fire() {
      progress.value = withSpring(1, POP_SPRING);
    }
  }, [delay, progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * offset },
      { scale: scaleFrom + (1 - scaleFrom) * progress.value },
    ],
  }));

  if (reducedMotion) {
    return <View style={style}>{children}</View>;
  }

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
