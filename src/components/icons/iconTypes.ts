/**
 * 图标共享类型 — 全站 SVG 图标的统一属性形状。
 */

import type { StyleProp, ViewStyle } from 'react-native';

/** SVG 图标属性。 */
export type IconProps = {
  /** 边长（px），宽高一致。 */
  size?: number;
  /** 描边 / 填充色，由调用方按主题传入。 */
  color: string;
  /** 容器样式。 */
  style?: StyleProp<ViewStyle>;
};

/** 支持实心 / 线性两态的图标额外属性。 */
export type FilledIconProps = IconProps & {
  /** 为 true 时渲染实心版本。 */
  filled?: boolean;
};
