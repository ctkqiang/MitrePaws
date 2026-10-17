/**
 * 肉爪图标 — MitrePaws 品牌形象，空态与品牌位使用。
 */

import { Circle, Ellipse, Svg } from 'react-native-svg';

import type { IconProps } from './iconTypes';

/**
 * 肉爪图标。
 *
 * @param props - 见 {@link IconProps}。
 */
export function PawIcon({ size = 24, color, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <Circle cx={6.8} cy={9.2} r={2} fill={color} />
      <Circle cx={10.3} cy={6.6} r={2} fill={color} />
      <Circle cx={13.7} cy={6.6} r={2} fill={color} />
      <Circle cx={17.2} cy={9.2} r={2} fill={color} />
      <Ellipse cx={12} cy={15.4} rx={4.6} ry={3.7} fill={color} />
    </Svg>
  );
}
