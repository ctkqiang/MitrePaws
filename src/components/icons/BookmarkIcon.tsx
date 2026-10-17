/**
 * 书签图标 — 支持线性 / 实心两态。
 */

import { Path, Svg } from 'react-native-svg';

import type { FilledIconProps } from './iconTypes';

/**
 * 书签图标。
 *
 * @param props - 见 {@link FilledIconProps}。
 */
export function BookmarkIcon({ size = 24, color, filled = false, style }: FilledIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <Path
        d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.6L6 20V5.5a1 1 0 0 1 1-1Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
