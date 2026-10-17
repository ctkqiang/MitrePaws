/**
 * 双语文本 — 按当前语言从 BilingualText 取值渲染。
 *
 * 自动应用全局字体缩放：如果 style 中包含 fontSize，则按缩放因子调整。
 */

import { Text, type StyleProp, type TextStyle } from 'react-native';

import { useFontScale } from '@/hooks/useFontScale';
import { useLocaleStore } from '@/stores/localeStore';
import type { BilingualText as BilingualTextValue } from '@/types/stix';
import { pickLocaleText } from '@/types/viewData';

/** 双语文本属性。 */
export type BilingualTextProps = {
  /** 双语文本值。 */
  text: BilingualTextValue;
  /** 可选样式。 */
  style?: StyleProp<TextStyle>;
  /** 可选行数限制。 */
  numberOfLines?: number;
};

/**
 * 将样式中的 fontSize 和 lineHeight 按全局缩放因子调整。
 *
 * @param {StyleProp<TextStyle>} style - 原始样式。
 * @param {number} scale - 缩放因子。
 * @returns {StyleProp<TextStyle>} 缩放后的样式。
 */
function applyFontScale(style: StyleProp<TextStyle>, scale: number): StyleProp<TextStyle> {
  if (scale === 1 || !style) return style;

  const styles = Array.isArray(style) ? style : [style];
  const result = styles.map((s) => {
    if (!s || typeof s !== 'object' || Array.isArray(s)) return s;
    const scaled: Record<string, unknown> = { ...s };
    if (typeof scaled.fontSize === 'number') {
      scaled.fontSize = Math.round(scaled.fontSize * scale * 10) / 10;
    }
    if (typeof scaled.lineHeight === 'number') {
      scaled.lineHeight = Math.round(scaled.lineHeight * scale * 10) / 10;
    }
    return scaled as TextStyle;
  });

  return result.length === 1 ? result[0] : result;
}

export function BilingualText({ text, style, numberOfLines }: BilingualTextProps) {
  const locale = useLocaleStore((s) => s.locale);
  const { scale } = useFontScale();
  return (
    <Text style={applyFontScale(style, scale)} numberOfLines={numberOfLines}>
      {pickLocaleText(text, locale)}
    </Text>
  );
}
