/**
 * 矩阵图标 — 九宫格，对应 ATT&CK 矩阵首页。
 */

import { G, Rect, Svg } from 'react-native-svg';

import type { IconProps } from './iconTypes';

/** 单元格坐标表（3×3）。 */
const CELLS = [
  [1.5, 1.5],
  [9, 1.5],
  [16.5, 1.5],
  [1.5, 9],
  [9, 9],
  [16.5, 9],
  [1.5, 16.5],
  [9, 16.5],
  [16.5, 16.5],
] as const;

/**
 * 九宫格矩阵图标。
 *
 * @param props - 见 {@link IconProps}。
 */
export function MatrixIcon({ size = 24, color, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <G fill={color}>
        {CELLS.map(([x, y]) => (
          <Rect key={`${x}-${y}`} x={x} y={y} width={6} height={6} rx={2} />
        ))}
      </G>
    </Svg>
  );
}
