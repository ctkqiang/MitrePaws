/**
 * 对勾图标 — 选中态确认。
 */

import { Polyline, Svg } from 'react-native-svg';

import type { IconProps } from './iconTypes';

/**
 * 对勾图标。
 *
 * @param props - 见 {@link IconProps}。
 */
export function CheckIcon({ size = 24, color, style }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}>
      <Polyline points="5,12.5 10,17.5 19,6.5" />
    </Svg>
  );
}
