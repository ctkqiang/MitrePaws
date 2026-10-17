/**
 * 放大镜图标 — 搜索入口与空态通用。
 */

import { Circle, Line, Svg } from 'react-native-svg';

import type { IconProps } from './iconTypes';

/**
 * 放大镜图标。
 *
 * @param props - 见 {@link IconProps}。
 */
export function SearchIcon({ size = 24, color, style }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      style={style}>
      <Circle cx={10.5} cy={10.5} r={6.5} />
      <Line x1={15.5} y1={15.5} x2={21} y2={21} />
    </Svg>
  );
}
