/**
 * 搜索框 — 字节式白底胶囊输入框，聚焦时 accent 描边 + 品牌色柔和外发光。
 *
 * 视觉决策：
 * - backgroundElement 纯白底 + pill 圆角，在 background 页面上形成
 *   「悬浮搜索条」的第一视觉焦点，与列表卡片共享同一材质语言；
 * - 聚焦反馈 = accent 描边 + 柔和外发光：iOS 走 shadow 三件套
 *   （opacity 0.25 / radius 10 / 零偏移），Web 走同值 boxShadow
 *   （#RRGGBBAA 的 0x40 ≈ 0.25），Android 不挂发光 — elevation 阴影
 *   无法表达零偏移光晕，强行叠加会发灰；
 * - 输入与占位统一 14px：RN 的 placeholder 继承 TextInput 字号，
 *   两处分开设置必然引入字号跳动，统一 14 是唯一无抖动解；
 * - 描边宽度固定 1：聚焦只换色不加粗，避免 hairline → 1.5px 的
 *   布局跳动。
 */

import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { SearchIcon } from '@/components/icons/SearchIcon';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme/tokens';

/** 聚焦外发光参数 — iOS shadow 与 Web boxShadow 共用的同值常量。 */
const GLOW_OPACITY = 0.25;
const GLOW_RADIUS = 10;

/** 搜索框属性。 */
export type SearchBarProps = {
  /** 当前查询串。 */
  value: string;
  /** 查询串变化回调。 */
  onChangeText: (text: string) => void;
  /** 占位符。 */
  placeholder: string;
  /** 是否自动聚焦。 */
  autoFocus?: boolean;
};

/**
 * 搜索框。
 *
 * @param props - 见 {@link SearchBarProps}。
 */
export function SearchBar({ value, onChangeText, placeholder, autoFocus }: SearchBarProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  /**
   * 聚焦外发光 — 按平台分流：iOS 用 shadow 三件套、Web 用同值
   * boxShadow（透明度 0.25 ≈ 0x40/255），Android 不发光。
   */
  const focusGlow = focused
    ? Platform.select({
        ios: {
          shadowColor: theme.accent,
          shadowOpacity: GLOW_OPACITY,
          shadowRadius: GLOW_RADIUS,
          shadowOffset: { width: 0, height: 0 },
        },
        web: { boxShadow: `0 0 ${GLOW_RADIUS}px ${theme.accent}40` },
        default: undefined,
      })
    : undefined;

  return (
    <View
      style={[
        styles.container,
        focusGlow,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: focused ? theme.accent : theme.border,
        },
      ]}>
      <SearchIcon size={20} color={focused ? theme.accent : theme.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.accent}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
        style={[styles.input, { color: theme.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
});
