/**
 * 搜索页 — 字节式改版：大标题 + 品牌渐变签名条 + 胶囊搜索框 + 实底选中
 * 筛选芯片 + 命中白卡列表。
 *
 * 性能约束：150ms debounce 命中管线（useSearchViewModel）原样保留，
 * 本页只改视觉；命中列表为 ScrollView 平铺、不挂任何入场动画。
 * 按压反馈统一为 opacity 0.85（抖音列表按压语言），用原生 Pressable
 * 函数式样式表达，零 worklet 开销、三端一致。
 * 首页货架「查看全部」会预置战术筛选跳入本页，芯片行同时承担
 * 筛选条件展示（选中高亮）与清除（点「全部战术」）两个职责。
 */

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnimatedEntrance } from '@/components/AnimatedEntrance';
import { EmptyState } from '@/components/EmptyState';
import { EntityCard } from '@/components/EntityCard';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { ScreenScaffold } from '@/components/ScreenScaffold';
import { SearchBar } from '@/components/SearchBar';
import { useTheme } from '@/hooks/use-theme';
import { formatMessage, useT } from '@/i18n';
import { haptics } from '@/services/haptics';
import { useLocaleStore } from '@/stores/localeStore';
import { DOUYIN_CYAN, Gradients, Radius, Spacing } from '@/theme/tokens';
import { pickLocaleText } from '@/types/viewData';
import { useMatrixViewModel } from '@/viewmodels/useMatrixViewModel';
import { useSearchViewModel } from '@/viewmodels/useSearchViewModel';

/** 按压态目标不透明度 — 抖音式列表按压语言。 */
const PRESSED_OPACITY = 0.85;

/** 页头品牌渐变签名条尺寸（px）。 */
const BRAND_BAR_WIDTH = 40;
const BRAND_BAR_HEIGHT = 4;

/** 数字段匹配 — 结果计数拆分染色用。 */
const NUMBER_PART_PATTERN = /^\d+$/;

/** 战术筛选芯片属性。 */
type FilterChipProps = {
  /** 芯片文案（已按当前语言取值）。 */
  label: string;
  /** 是否选中。 */
  selected: boolean;
  /** 点击回调。 */
  onPress: () => void;
};

/**
 * 战术筛选芯片 — 字节式实底选中胶囊（与技术列表页同款）。
 *
 * 选中态 accent 实底 + onAccent 字 700、未选中 backgroundElement +
 * border + textSecondary：字色取语义键 onAccent 保证深色主题下
 * 提亮 accent 之上的对比度仍达 WCAG AA。
 *
 * 页内私有组件：字节态样只服务列表/搜索两页，不回写全局 TacticChip，
 * 避免波及矩阵页仍在使用的实底选中样式。
 */
function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.accent : theme.backgroundElement,
          borderColor: selected ? theme.accent : theme.border,
          opacity: pressed ? PRESSED_OPACITY : 1,
        },
      ]}>
      <Text
        style={[
          styles.chipText,
          { color: selected ? theme.onAccent : theme.textSecondary },
          selected && styles.chipTextSelected,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * 结果计数 — 数字段用抖音青强调并锁定等宽数字。
 *
 * formatMessage(t('list.resultCount')) 产物形如「3 条结果」，按数字段
 * split 后分段渲染：数字段 DOUYIN_CYAN + 700 + tabular-nums（字节式
 * 数据强调），文字段继承外层次级色。
 */
function ResultCount({ text }: { text: string }) {
  const parts = text.split(/(\d+)/);
  return (
    <Text style={styles.countText}>
      {parts.map((part, index) =>
        NUMBER_PART_PATTERN.test(part) ? (
          <Text key={index} style={styles.countNumber}>
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        ),
      )}
    </Text>
  );
}

/** 搜索页路由组件。 */
export default function SearchScreen() {
  const t = useT();
  const theme = useTheme();
  const locale = useLocaleStore((s) => s.locale);
  const { query, setQuery, hits, tacticFilter, setTacticFilter } = useSearchViewModel();
  const matrixResource = useMatrixViewModel();
  const columns = matrixResource.status === 'ready' ? matrixResource.data : [];

  /**
   * 切换战术筛选。筛选切换属「游标移动」语义，按 haptics 门面契约只在
   * 这类时机触发选择型轻触；命中列表项不加入任何触感。
   */
  const handleTacticPress = (tacticId: string | null) => {
    haptics.selection();
    setTacticFilter(tacticId);
  };

  return (
    <ScreenScaffold scroll>
      <AnimatedEntrance>
        <Text style={[styles.title, { color: theme.text }]}>{t('tabs.search')}</Text>
        <LinearGradient
          colors={[...Gradients.brand]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.brandBar}
        />
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('search.placeholder')}
          autoFocus
        />
      </AnimatedEntrance>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}>
        <FilterChip
          label={t('search.filterAll')}
          selected={tacticFilter === null}
          onPress={() => handleTacticPress(null)}
        />
        {columns.map((col) => (
          <FilterChip
            key={col.externalId}
            label={pickLocaleText(col.name, locale)}
            selected={tacticFilter === col.externalId}
            onPress={() => handleTacticPress(col.externalId)}
          />
        ))}
      </ScrollView>

      {query.trim().length === 0 && (
        <EmptyState
          title={t('tabs.search')}
          message={t('search.placeholder')}
          icon={<SearchIcon size={36} color={theme.accent} />}
        />
      )}
      {query.trim().length > 0 && hits.length === 0 && (
        <EmptyState title={t('common.noResults.title')} message={t('common.noResults.message')} />
      )}
      {hits.length > 0 && (
        <View>
          <ResultCount text={formatMessage(t('list.resultCount'), { count: hits.length })} />
          <View style={styles.list}>
            {hits.map((hit) => (
              <EntityCard
                key={`${hit.kind}-${hit.id}`}
                externalId={hit.externalId}
                name={hit.name}
                subtitle={hit.tacticShortname ?? undefined}
                onPress={
                  hit.kind === 'technique'
                    ? () => router.push({ pathname: '/techniques/[id]', params: { id: hit.id } })
                    : undefined
                }
              />
            ))}
          </View>
        </View>
      )}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandBar: {
    width: BRAND_BAR_WIDTH,
    height: BRAND_BAR_HEIGHT,
    borderRadius: Radius.pill,
    marginTop: Spacing.two + Spacing.one,
    marginBottom: Spacing.three,
  },
  countText: {
    fontSize: 13,
    marginBottom: Spacing.two + Spacing.one,
  },
  countNumber: {
    color: DOUYIN_CYAN,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  chipsRow: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    fontWeight: '700',
  },
  list: {
    gap: Spacing.two + Spacing.one,
  },
});
