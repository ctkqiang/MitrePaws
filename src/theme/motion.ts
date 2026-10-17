/**
 * 动效预设 — 全项目唯一的动画参数来源。
 *
 * 设计目标为规范 §11.4 要求的「冷静、跟手」手感：
 * 短促、低回弹的弹簧，避免卡通化的夸张振荡。
 * 所有 spring 配置均可直接传给 Reanimated 的 withSpring。
 */

import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/** 按压下去：刚度高、阻尼大，几乎无回弹，跟手收敛。 */
export const PRESS_SPRING: WithSpringConfig = {
  stiffness: 320,
  damping: 24,
  mass: 0.8,
  overshootClamping: true,
} as const;

/** 松开回弹：保留一点点可爱的过冲，然后迅速停稳。 */
export const RELEASE_SPRING: WithSpringConfig = {
  stiffness: 260,
  damping: 17,
  mass: 0.8,
} as const;

/** 选中态弹跳：用于标签图标「啵」一下的低回弹 pop；damping 提高让入场动画更快停稳、低帧率下不抖。 */
export const POP_SPRING: WithSpringConfig = {
  stiffness: 300,
  damping: 20,
  mass: 0.9,
} as const;

/** 颜色交叉淡化时长（毫秒）。 */
export const COLOR_TIMING: WithTimingConfig = {
  duration: 180,
} as const;

/** 减弱动态效果时，装饰性动画退化为瞬时淡入淡出的时长（毫秒）。 */
export const REDUCED_FADE_DURATION = 150;

/** 按压缩放目标比例。 */
export const PRESSED_SCALE = 0.96;

/** 标签图标选中时的最大放大比例。 */
export const TAB_ICON_POP_SCALE = 1.22;
