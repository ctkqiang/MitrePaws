/**
 * 技术列表页 — 字节式改版：大标题 + 品牌渐变签名条 + 白底胶囊搜索框 +
 * 实底选中筛选芯片 + 白卡列表。
 *
 * 架构约束：
 * - 过滤逻辑与 ScrollView 平铺渲染保持原样：数据集为内存全量过滤、
 *   已验证流畅，本页只动视觉不动数据管线；
 * - 页面动效只保留标题区一次入场（AnimatedEntrance），列表项绝不挂
 *   entering 动画 — 并发渲染下的弹簧并发是已知帧率杀手；
 * - 按压反馈统一为 opacity 0.85（抖音列表按压语言），用原生 Pressable
 *   函数式样式表达，不再走 Reanimated 弹簧缩放：芯片行高频连点，
 *   透明度反馈零 worklet 布局开销，三端表现一致；
 * - 首页货架「查看全部」会预置战术筛选跳入本页，芯片行同时承担
 *   筛选条件展示（选中高亮）与清除（点「全部战术」）两个职责。
 */

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnimatedEntrance } from '@/components/AnimatedEntrance';
import { EmptyState } from '@/components/EmptyState';
import { EntityCard } from '@/components/EntityCard';
import { StarIcon } from '@/components/icons/StarIcon';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ScreenScaffold } from '@/components/ScreenScaffold';
import { SearchBar } from '@/components/SearchBar';
import { useTheme } from '@/hooks/use-theme';
import { formatMessage, useT } from '@/i18n';
import { haptics } from '@/services/haptics';
import { useLocaleStore } from '@/stores/localeStore';
import { useSearchFilterStore } from '@/stores/searchFilterStore';
import { DOUYIN_CYAN, Gradients, Radius, Spacing } from '@/theme/tokens';
import { pickLocaleText } from '@/types/viewData';
import { useMatrixViewModel } from '@/viewmodels/useMatrixViewModel';
import { useTechniqueListViewModel } from '@/viewmodels/useTechniqueListViewModel';

/** 按压态目标不透明度 — 抖音式列表按压语言。 */
const PRESSED_OPACITY = 0.85;

/** 页头品牌渐变签名条尺寸（px）。 */
const BRAND_BAR_WIDTH = 40;
const BRAND_BAR_HEIGHT = 4;

/** 数字段匹配 — 计数文案拆分染色用。 */
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
 * 战术筛选芯片 — 字节式实底选中胶囊。
 *
 * 选中态用 accent 实底 + onAccent 字 700：强对比的「按钮级」选中信号，
 * 让筛选条件在一屏芯片行里一眼可辨；未选中保持 backgroundElement +
 * border + textSecondary 的弱存在感。字色取语义键 onAccent 而非写死
 * 白色 — 浅色主题下即白字，深色主题 accent 提亮为浅蓝、白字对比度
 * 不足 2.2:1，onAccent 的深字才能守住 WCAG AA。
 *
 * 按压反馈为 opacity 0.85，走原生 Pressable 函数式样式。
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
 * 页头计数 — 数字段用抖音青强调并锁定等宽数字，文字段继承次级色。
 *
 * formatMessage 产物形如「共 614 条结果」，按数字段 split 后分段渲染：
 * 数字段 DOUYIN_CYAN + 700 + tabular-nums（字节式数据强调），
 * 其余文字段无样式、继承外层次级色。
 */
function HeaderCount({ text }: { text: string }) {
  const theme = useTheme();
  const parts = text.split(/(\d+)/);
  return (
    <Text style={[styles.countText, { color: theme.textSecondary }]}>
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

/** 技术列表页路由组件。 */
export default function TechniquesScreen() {
  const t = useT();
  const theme = useTheme();
  const locale = useLocaleStore((s) => s.locale);
  const query = useSearchFilterStore((s) => s.query);
  const setQuery = useSearchFilterStore((s) => s.setQuery);
  const tacticFilter = useSearchFilterStore((s) => s.tacticFilter);
  const setTacticFilter = useSearchFilterStore((s) => s.setTacticFilter);

  const listResource = useTechniqueListViewModel();
  const matrixResource = useMatrixViewModel();
  const columns = matrixResource.status === 'ready' ? matrixResource.data : [];
  const selectedShortname = columns.find((c) => c.externalId === tacticFilter)?.shortname ?? null;

  const allItems = listResource.status === 'ready' ? listResource.data : [];
  const trimmed = query.trim().toLowerCase();
  const items = allItems.filter((item) => {
    if (tacticFilter !== null && item.tacticShortname !== selectedShortname) return false;
    if (trimmed.length === 0) return true;
    const inName =
      item.name.en.toLowerCase().includes(trimmed) ||
      item.name.zh.toLowerCase().includes(trimmed);
    const inId = item.externalId.toLowerCase().includes(trimmed);
    return inName || inId;
  });

  const headerCount = formatMessage(t('techniques.count'), { count: items.length });

  /**
   * 切换战术筛选。筛选切换属「游标移动」语义，按 haptics 门面契约只在
   * 这类时机触发选择型轻触；列表项点击不加入任何触感。
   */
  const handleTacticPress = (tacticId: string | null) => {
    haptics.selection();
    setTacticFilter(tacticId);
  };

  return (
    <ScreenScaffold scroll>
      <AnimatedEntrance>
        <Text style={[styles.title, { color: theme.text }]}>{t('techniques.title')}</Text>
        <LinearGradient
          colors={[...Gradients.brand]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.brandBar}
        />
        <HeaderCount text={headerCount} />
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('search.placeholder')} />
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

      {listResource.status === 'loading' && <LoadingSkeleton />}
      {listResource.status === 'error' && (
        <EmptyState title={t('common.error')} message={t('common.error')} />
      )}
      {listResource.status === 'ready' && items.length === 0 && (
        <EmptyState title={t('common.noResults.title')} message={t('common.noResults.message')} />
      )}
      <View style={styles.list}>
        {items.map((item) => (
          <EntityCard
            key={item.id}
            externalId={item.externalId}
            name={item.name}
            subtitle={item.tacticShortname}
            rightAccessory={
              item.isBookmarked ? <StarIcon size={16} filled color={theme.accent} /> : undefined
            }
            onPress={() =>
              router.push({ pathname: '/techniques/[id]', params: { id: item.id } })
            }
          />
        ))}
      </View>
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
  },
  countText: {
    fontSize: 13,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
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
