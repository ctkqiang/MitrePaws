/**
 * 货架技术卡 — 豆包式白底紧凑卡：编号 + 单行名称 + 次要信息行。
 *
 * 视觉决策：
 * - 去掉原编号色带与阴影，只留 hairline 描边，层级交给白卡与页面
 *   背景的色差本身（豆包靠层级不靠阴影）；
 * - 名称单行截断，卡片高度稳定，横滑货架节奏一致；
 * - 按压反馈交给项目统一的 {@link PressableScale}（弹簧缩放，
 *   减弱动态时自动退化为半透明），不在列表项上挂任何入场动画。
 */

import { StyleSheet, Text, View } from 'react-native';

import { BilingualText } from '@/components/BilingualText';
import { ChevronRightIcon } from '@/components/icons/ChevronRightIcon';
import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/hooks/use-theme';
import { formatMessage, useT } from '@/i18n';
import { Fonts, Radius, Spacing } from '@/theme/tokens';
import type { MatrixTechniqueCell } from '@/types/viewData';

/** 货架技术卡属性。 */
export type TechniqueShelfCardProps = {
  /** 技术单元数据。 */
  cell: MatrixTechniqueCell;
  /** 点击跳详情。 */
  onPress: () => void;
};

/** 卡片固定宽度，货架横滑时保持节奏感。 */
export const SHELF_CARD_WIDTH = 168;

/**
 * 货架技术卡。
 *
 * @param props - 见 {@link TechniqueShelfCardProps}。
 */
export function TechniqueShelfCard({ cell, onPress }: TechniqueShelfCardProps) {
  const theme = useTheme();
  const t = useT();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={cell.externalId}
      activeScale={0.97}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
        },
      ]}>
      <Text style={[styles.code, { color: theme.accent }]}>{cell.externalId}</Text>
      <BilingualText
        text={cell.name}
        style={[styles.name, { color: theme.text }]}
        numberOfLines={1}
      />
      <View style={styles.footer}>
        {cell.subtechniqueCount > 0 ? (
          <Text style={[styles.subText, { color: theme.textSecondary }]} numberOfLines={1}>
            {formatMessage(t('matrix.subCount'), { count: cell.subtechniqueCount })}
          </Text>
        ) : (
          <View style={styles.footerSpacer} />
        )}
        <ChevronRightIcon size={14} color={theme.textSecondary} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SHELF_CARD_WIDTH,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
  },
  code: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Fonts.mono,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.3,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: Spacing.two,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 16,
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
  footerSpacer: {
    flex: 1,
  },
  subText: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
});
