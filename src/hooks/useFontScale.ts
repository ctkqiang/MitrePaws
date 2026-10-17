/**
 * 字体缩放钩子 — 提供全局字体缩放能力。
 *
 * 返回当前字体大小、缩放因子（相对默认 14 的比例）、
 * 以及一个按基准值计算缩放后尺寸的函数。
 */

import { FONT_SIZE_DEFAULT, useFontScaleStore } from '@/stores/fontScaleStore';

/** 字体缩放返回值。 */
export type FontScale = {
  /** 当前字体基准大小（10-30）。 */
  fontSize: number;
  /** 缩放因子（fontSize / 14）。 */
  scale: number;
  /** 按基准值计算缩放后的尺寸。 */
  scaled: (baseSize: number) => number;
  /** 是否使用默认大小。 */
  isDefault: boolean;
};

/**
 * 获取当前字体缩放状态。
 *
 * @returns {FontScale} 字体缩放信息。
 */
export function useFontScale(): FontScale {
  const fontSize = useFontScaleStore((s) => s.fontSize);
  const scale = fontSize / FONT_SIZE_DEFAULT;

  return {
    fontSize,
    scale,
    scaled: (baseSize: number) => Math.round(baseSize * scale * 10) / 10,
    isDefault: fontSize === FONT_SIZE_DEFAULT,
  };
}
