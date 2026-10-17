/**
 * 液态玻璃表面 — iOS 17+ 用系统原生玻璃，其他平台用极淡底色 + Web 强模糊。
 * 核心原则：背景几乎不可见，只留模糊和极淡边框，让内容色自然透上来。
 */

import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** 玻璃表面属性。 */
export type GlassSurfaceProps = {
  /** 子内容。 */
  children: ReactNode;
  /** 容器样式（圆角 / 内边距等）。 */
  style?: StyleProp<ViewStyle>;
};

/**
 * 液态玻璃表面。
 *
 * @param props - 见 {@link GlassSurfaceProps}。
 */
export function GlassSurface({ children, style }: GlassSurfaceProps) {
  const theme = useTheme();

  // iOS 原生玻璃：不设 tintColor，让系统玻璃自己透，不染底色
  if (Platform.OS === 'ios' && isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        style={[styles.surface, style]}>
        {children}
      </GlassView>
    );
  }

  // 其他平台：极淡底色 + Web 强模糊，视觉语义一致
  return (
    <View
      style={[
        styles.surface,
        style,
        {
          backgroundColor: Platform.OS === 'web'
            ? theme.surfaceGlass.replace(/[\d.]+\)$/, '0.25)') // 极淡
            : theme.surfaceGlass.replace(/[\d.]+\)$/, '0.35)'), // 稍淡
          borderColor: theme.border,
        },
        Platform.OS === 'web' ? styles.webFrost : null,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  webFrost: {
    backdropFilter: 'blur(28px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
  } as unknown as ViewStyle,
});
