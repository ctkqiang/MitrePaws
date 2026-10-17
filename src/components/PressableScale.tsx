/**
 * 按压缩放容器 — 全项目统一的「可点」触感视觉。
 *
 * 按下时以短促弹簧缩到 activeScale，松开以低回弹弹簧复位；
 * 用户开启系统「减弱动态效果」时退化为半透明反馈，符合规范 §11.4。
 *
 * 实现注意：样式必须以「静态数组」传给 AnimatedPressable。Reanimated Web
 * 包装后的 Pressable 不会正确应用函数式 style（卡片背景/row 布局会整体
 * 丢失），因此按压态也通过共享值在 worklet 内参与样式计算。
 */

import type { ReactNode } from 'react';
import {
    Pressable,
    type Insets,
    type PressableProps,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { PRESS_SPRING, PRESSED_SCALE, RELEASE_SPRING } from '@/theme/motion';

/** 无障碍角色，直接跟随 Pressable 的官方类型。 */
type AccessibilityRole = NonNullable<PressableProps['accessibilityRole']>;
/** 无障碍状态形状，直接跟随 Pressable 的官方类型。 */
type AccessibilityState = NonNullable<PressableProps['accessibilityState']>;

/** Reanimated 包装后的 Pressable，可吃 animated style。 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** 减弱动态效果时按下的最低不透明度。 */
const REDUCED_PRESSED_OPACITY = 0.65;

/** 按压缩放容器属性。 */
export type PressableScaleProps = {
  /** 子内容。 */
  children: ReactNode;
  /** 点击回调。 */
  onPress?: () => void;
  /** 长按回调。 */
  onLongPress?: () => void;
  /** 是否禁用交互。 */
  disabled?: boolean;
  /** 点击热区扩展。 */
  hitSlop?: number | Insets;
  /** 无障碍标签。 */
  accessibilityLabel?: string;
  /** 无障碍角色，默认 button。 */
  accessibilityRole?: AccessibilityRole;
  /** 无障碍状态（如 selected / disabled）。 */
  accessibilityState?: AccessibilityState;
  /** 按下时目标缩放比例，默认 0.96。 */
  activeScale?: number;
  /** 容器静态样式。 */
  style?: StyleProp<ViewStyle>;
};

/**
 * 按压缩放容器。
 *
 * @param props - 见 {@link PressableScaleProps}。
 */
export function PressableScale({
    children,
    onPress,
    onLongPress,
    disabled = false,
    hitSlop,
    accessibilityLabel,
    accessibilityRole = 'button',
    accessibilityState,
    activeScale = PRESSED_SCALE,
    style,
}: PressableScaleProps) {
    const reducedMotion = useReducedMotion();
    const scale = useSharedValue(1);
    const pressed = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        'worklet';

        if (reducedMotion) {
            return {
                opacity: 1 - (1 - REDUCED_PRESSED_OPACITY) * pressed.value,
            };
        }
        return {
            transform: [{ scale: scale.value }],
        };
    }, [reducedMotion]);

    /** 按下：跟手快速收敛，无过冲；减弱动态时只做半透明。 */
    const handlePressIn = () => {
        if (reducedMotion) {
            pressed.value = 1;
            return;
        }
        scale.value = withSpring(activeScale, PRESS_SPRING);
    };

    /** 松开：一点点可爱过冲后停稳；减弱动态时恢复不透明。 */
    const handlePressOut = () => {
        if (reducedMotion) {
            pressed.value = 0;
            return;
        }
        scale.value = withSpring(1, RELEASE_SPRING);
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            hitSlop={hitSlop}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
            accessibilityState={accessibilityState}
            style={[style, animatedStyle]}>
            {children}
        </AnimatedPressable>
    );
}
