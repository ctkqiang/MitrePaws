/**
 * 叠层图标 — 对应「技术」标签。
 */

import { Path, Polyline, Svg } from 'react-native-svg';

import type { IconProps } from './iconTypes';

/**
 * 叠层图标。
 *
 * @param props - 见 {@link IconProps}。
 */
export function LayersIcon({ size = 24, color, style }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
      strokeLinecap="round"
      style={style}>
      <Path d="M12 3.5 20.5 8 12 12.5 3.5 8 12 3.5Z" />
      <Polyline points="3.5,12 12,16.5 20.5,12" fill="none" />
      <Polyline points="3.5,16 12,20.5 20.5,16" fill="none" />
    </Svg>
  );
}
