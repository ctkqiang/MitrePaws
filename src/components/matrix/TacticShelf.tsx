/**
 * 战术货架 — 豆包式分节：节头（战术名 + 数量胶囊 + 查看全部）+ 横滑技术卡。
 *
 * 视觉决策：
 * - 节头对齐 SectionHeader 的信息层级：17 semibold 标题、accentSoft
 *   数量胶囊、右侧 accent 链接色「查看全部」；
 * - 整条货架不挂任何入场动画：货架数量随数据集可达 14 个，
 *   错峰弹簧会并发拉起大量 worklet（性能红线），页面动效只保留 Hero 一次淡入。
 */

import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BilingualText } from '@/components/BilingualText';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { haptics } from '@/services/haptics';
import { useSearchFilterStore } from '@/stores/searchFilterStore';
import { Radius, Spacing } from '@/theme/tokens';
import type { MatrixColumn } from '@/types/viewData';

import { TechniqueShelfCard } from './TechniqueShelfCard';

/** 战术货架属性。 */
export type TacticShelfProps = {
  /** 战术列数据。 */
  column: MatrixColumn;
};

/**
 * 战术货架。
 *
 * @param props - 见 {@link TacticShelfProps}。
 */
export function TacticShelf({ column }: TacticShelfProps) {
  const theme = useTheme();
  const t = useT();
  const setTacticFilter = useSearchFilterStore((s) => s.setTacticFilter);

  /**
   * 「查看全部」— 预设该战术筛选后跳技术列表页。
   * 属「标签切换」语义，按规范只在此类时机触发选择型轻触。
   */
  const handleViewAll = () => {
    setTacticFilter(column.externalId);
    haptics.selection();
    router.push({ pathname: '/techniques' });
  };

  return (
    <View style={styles.shelf}>
      <View style={styles.header}>
        <BilingualText
          text={column.name}
          style={[styles.headerTitle, { color: theme.text }]}
          numberOfLines={1}
        />
        <View style={[styles.countPill, { backgroundColor: theme.accentSoft }]}>
          <Text style={[styles.countText, { color: theme.accent }]}>
            {column.techniques.length}
          </Text>
        </View>
        <Pressable
          onPress={handleViewAll}
          accessibilityRole="link"
          accessibilityLabel={t('home.viewAll')}
          hitSlop={Spacing.two}
          style={({ pressed }) => [styles.viewAll, pressed && styles.viewAllPressed]}>
          <Text style={[styles.viewAllText, { color: theme.accent }]}>{t('home.viewAll')}</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}>
        {column.techniques.map((cell) => (
          <TechniqueShelfCard
            key={cell.id}
            cell={cell}
            onPress={() =>
              router.push({ pathname: '/techniques/[id]', params: { id: cell.id } })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shelf: {
    marginBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    flexShrink: 1,
  },
  countPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half + 1,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  viewAll: {
    marginLeft: 'auto',
  },
  viewAllPressed: {
    opacity: 0.85,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rail: {
    gap: Spacing.two + Spacing.one,
    paddingRight: Spacing.three,
    paddingBottom: Spacing.one,
  },
});
