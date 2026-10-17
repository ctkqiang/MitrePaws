/**
 * 加载骨架屏 — Animated 透明度脉冲的占位行。
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme/tokens';

/** 骨架屏属性。 */
export type LoadingSkeletonProps = {
  /** 占位行数，默认 4。 */
  lines?: number;
};

export function LoadingSkeleton({ lines = 4 }: LoadingSkeletonProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 650, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.container}>
      {Array.from({ length: lines }, (_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.line,
            {
              backgroundColor: theme.backgroundElement,
              opacity,
              width: i === 0 ? '60%' : '100%',
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  line: {
    height: 16,
    borderRadius: Radius.sm,
  },
});
