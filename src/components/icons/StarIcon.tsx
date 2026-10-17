/**
 * 星形图标 — 收藏标记，支持线性 / 实心两态。
 */

import { Path, Svg } from 'react-native-svg';

import type { FilledIconProps } from './iconTypes';

/**
 * 星形图标。
 *
 * @param props - 见 {@link FilledIconProps}。
 */
export function StarIcon({ size = 24, color, filled = false, style }: FilledIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <Path
        d="M12 3.6 14.5 9l5.9.8-4.3 4.1 1.1 5.8L12 16.9l-5.2 2.8 1.1-5.8L3.6 9.8 9.5 9 12 3.6Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
