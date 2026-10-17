/**
 * 左向尖角图标 — 返回上一页。
 */

import { Polyline, Svg } from 'react-native-svg';

import type { IconProps } from './iconTypes';

/**
 * 左向尖角图标。
 *
 * @param props - 见 {@link IconProps}。
 */
export function ChevronLeftIcon({ size = 24, color, style }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}>
      <Polyline points="14.5,6 8.5,12 14.5,18" />
    </Svg>
  );
}
