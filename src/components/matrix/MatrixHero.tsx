/**
 * 矩阵页 Hero — 字节系主视觉：深空渐变卡 + 抖音红青色差光晕 + 大字排版。
 *
 * 视觉决策：
 * - 渐变底在双主题下固定为深空色（tokens.Gradients.hero），卡内文字
 *   固定白色以同时满足两个主题的对比度，不随 theme 翻转；
 * - 红青两枚低透明光晕复刻抖音标志性的色差（chromatic aberration）
 *   品牌感，绝对定位且被卡片 overflow 裁剪，不产生额外布局成本；
 * - 组件内部不挂任何动画：入场只由外层 AnimatedEntrance 提供
 *   一次轻量淡入，系统减弱动态时由该容器统一降级。
 */

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { useT } from '@/i18n';
import { DOUYIN_CYAN, DOUYIN_RED, Gradients, Radius, Spacing } from '@/theme/tokens';

/** 矩阵 Hero 属性。 */
export type MatrixHeroProps = {
  /** 战术总数。 */
  tacticCount: number;
  /** 主技术总数。 */
  techniqueCount: number;
};

/**
 * 矩阵页顶部 Hero。
 *
 * @param props - 见 {@link MatrixHeroProps}。
 */
export function MatrixHero({ tacticCount, techniqueCount }: MatrixHeroProps) {
  const t = useT();

  const stats = [
    { key: 'tactics', value: tacticCount, label: t('matrix.statsTactics') },
    { key: 'techniques', value: techniqueCount, label: t('matrix.statsTechniques') },
  ] as const;

  return (
    <View style={styles.hero}>
      <LinearGradient
        colors={[...Gradients.hero]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <View style={[styles.glow, styles.glowRed]} />
        <View style={[styles.glow, styles.glowCyan]} />

        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{t('matrix.heroTag')}</Text>
        </View>

        <Text style={styles.title}>{t('matrix.title')}</Text>
        <Text style={styles.subtitle}>{t('matrix.subtitle')}</Text>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.key} style={styles.statCard}>
              <Text style={styles.statNumber}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: Spacing.four,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
  },
  glowRed: {
    top: -70,
    right: -50,
    backgroundColor: DOUYIN_RED,
    opacity: 0.32,
  },
  glowCyan: {
    bottom: -80,
    left: -60,
    backgroundColor: DOUYIN_CYAN,
    opacity: 0.22,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.half + 2,
    marginBottom: Spacing.three,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DOUYIN_CYAN,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    marginTop: Spacing.one,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.72)',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: Spacing.three,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: Spacing.half,
    letterSpacing: 0.2,
    color: 'rgba(255, 255, 255, 0.65)',
  },
});
