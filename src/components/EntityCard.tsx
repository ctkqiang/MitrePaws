/**
 * 实体卡片 — 字节式白底行卡：accentSoft 锚点竖条 + 编号徽标 + 名称 +
 * 副标题 + 右侧 chevron。
 *
 * 视觉决策：
 * - 左侧 3px 宽、高 60% 的 accentSoft 竖条是字节式列表锚点：数百行
 *   滚动时给视线一个稳定的纵向对齐基准；soft 色不与 accent 徽标、
 *   星标争夺注意力，只做结构性的「行首签名」；
 * - 按压反馈用 opacity 0.85（抖音列表按压语言）替代弹簧缩放 — 原生
 *   Pressable 函数式样式即可表达，省去 worklet 开销，列表高频连点
 *   三端表现一致；
 * - 卡面统一 backgroundElement + hairline 描边 + Radius.md(14) —
 *   列表页一屏可滚过数百行，中圆角在保持柔和观感的同时比大圆角更省
 *   纵向空间；柔和投影只做「浅浮雕」层级，不与 accent 争夺注意力。
 */

import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { ChevronRightIcon } from '@/components/icons/ChevronRightIcon';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme/tokens';
import type { BilingualText as BilingualTextValue } from '@/types/stix';

import { BilingualText } from './BilingualText';
import { ExternalIdBadge } from './ExternalIdBadge';

/** 按压态目标不透明度 — 抖音式列表按压语言。 */
const PRESSED_OPACITY = 0.85;

/** 列表锚点竖条宽度（px）。 */
const ACCENT_BAR_WIDTH = 3;

/** 实体卡片属性。 */
export type EntityCardProps = {
  /** 外部编号。 */
  externalId: string;
  /** 双语名称。 */
  name: BilingualTextValue;
  /** 可选副标题。 */
  subtitle?: string;
  /** 可选右侧自定义节点；提供时替代默认 chevron。 */
  rightAccessory?: React.ReactNode;
  /** 可选点击回调；提供时显示 chevron。 */
  onPress?: () => void;
  /** 可选容器样式。 */
  style?: StyleProp<ViewStyle>;
};

/**
 * 实体卡片。
 *
 * @param props - 见 {@link EntityCardProps}。
 */
export function EntityCard({
  externalId,
  name,
  subtitle,
  rightAccessory,
  onPress,
  style,
}: EntityCardProps) {
  const theme = useTheme();

  const cardBody = (
    <>
      <View style={[styles.accentBar, { backgroundColor: theme.accentSoft }]} />
      <ExternalIdBadge value={externalId} />
      <View style={styles.body}>
        <BilingualText text={name} style={[styles.name, { color: theme.text }]} numberOfLines={2} />
        {subtitle !== undefined && subtitle.length > 0 && (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightAccessory !== undefined ? (
        rightAccessory
      ) : onPress !== undefined ? (
        <ChevronRightIcon size={16} color={theme.textSecondary} />
      ) : null}
    </>
  );

  /** 静态展示与可按压两分支共享同一卡面材质，保证渲染分支切换时零视觉跳动。 */
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      backgroundColor: theme.backgroundElement,
      borderColor: theme.border,
      shadowColor: theme.shadow,
    },
    style,
  ];

  if (onPress === undefined) {
    return <View style={cardStyle}>{cardBody}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
      {cardBody}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - Spacing.half,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  accentBar: {
    width: ACCENT_BAR_WIDTH,
    height: '60%',
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
  },
});
