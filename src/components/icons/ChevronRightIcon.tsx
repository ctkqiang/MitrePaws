/**
 * 右向尖角图标 — 列表行「可进入」提示。
 */

import { Polyline, Svg } from 'react-native-svg';

import type { IconProps } from './iconTypes';

/**
 * 右向尖角图标。
 *
 * @param props - 见 {@link IconProps}。
 */
export function ChevronRightIcon({ size = 24, color, style }: IconProps) {
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
      <Polyline points="9.5,6 15.5,12 9.5,18" />
    </Svg>
  );
}
