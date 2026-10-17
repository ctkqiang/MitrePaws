/**
 * 书签页 — 收藏内容的离线索引。
 *
 * 视觉采用字节系页头 + 豆包式「单卡分组」布局：28/800 大标题下压一枚
 * 40x4 品牌渐变签名条（Gradients.brand）；标题旁的数量徽章以霓虹渐变
 * （Gradients.neon）打底、白色数字；「清空」为危险色 8% 低透明药丸。
 * 列表保持单卡 + hairline 分隔，按压整行 0.85 透明度反馈；
 * 行不挂 entering，保证长列表帧率。
 */

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnimatedEntrance } from '@/components/AnimatedEntrance';
import { BilingualText } from '@/components/BilingualText';
import { EmptyState } from '@/components/EmptyState';
import { ExternalIdBadge } from '@/components/ExternalIdBadge';
import { ChevronRightIcon } from '@/components/icons/ChevronRightIcon';
import { PressableScale } from '@/components/PressableScale';
import { ScreenScaffold } from '@/components/ScreenScaffold';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { haptics } from '@/services/haptics';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { Gradients, Radius, Spacing } from '@/theme/tokens';
import type { BookmarkItem } from '@/types/viewData';
import { useBookmarksViewModel } from '@/viewmodels/useBookmarksViewModel';

/** 渐变面上的前景固定白色 — 渐变底在双主题下均为深色底（与 tokens 约定一致）。 */
const ON_GRADIENT = '#FFFFFF';

/** 危险色低透明底的十六进制 alpha 后缀，0x14 ≈ 8%（#RRGGBBAA）。 */
const DANGER_TINT_ALPHA = '14';

/** 单条书签行的属性。 */
type BookmarkRowProps = {
  /** 书签行数据。 */
  item: BookmarkItem;
  /** 是否为组内最后一行：决定是否绘制 hairline 分隔线。 */
  isLast: boolean;
  /** 点击回调，由屏幕统一路由到技术详情。 */
  onPress: (item: BookmarkItem) => void;
};

/**
 * 书签行 — ATT&CK 编号徽标 + 双语技术名 + 战术副标题 + 右滑箭头。
 *
 * 按压反馈为整行 0.85 透明度（字节列表行的轻触感）；
 * 分隔线挂在行自身上，避免父容器插入多余节点。
 *
 * @param props - 见 {@link BookmarkRowProps}。
 */
function BookmarkRow({ item, isLast, onPress }: BookmarkRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        { borderBottomColor: theme.border },
        pressed && styles.rowPressed,
      ]}>
      <ExternalIdBadge value={item.externalId} />
      <View style={styles.rowBody}>
        <BilingualText
          text={item.name}
          style={[styles.rowName, { color: theme.text }]}
          numberOfLines={2}
        />
        {item.tacticShortname !== null && item.tacticShortname.length > 0 && (
          <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.tacticShortname}
          </Text>
        )}
      </View>
      <ChevronRightIcon size={16} color={theme.textSecondary} />
    </Pressable>
  );
}

/** 书签页路由组件。 */
export default function BookmarksScreen() {
  const t = useT();
  const theme = useTheme();
  const resource = useBookmarksViewModel();
  const clear = useBookmarkStore((s) => s.clear);

  const items = resource.status === 'ready' ? resource.data : [];
  const isEmpty = resource.status === 'ready' && items.length === 0;

  /**
   * 清空书签 — 破坏性确认操作。
   * 先给一次轻触感让用户感知「确实触发了」，再执行清空。
   */
  const handleClear = () => {
    haptics.lightImpact();
    clear();
  };

  /**
   * 跳转技术详情。
   * 纯导航不属于确认操作，不触发触感反馈，避免列表行反馈过载。
   */
  const openTechnique = (item: BookmarkItem) => {
    router.push({ pathname: '/techniques/[id]', params: { id: item.id } });
  };

  return (
    <ScreenScaffold scroll>
      {/* 字节式页头：大标题 + 数量渐变徽章 + 清空药丸 + 品牌渐变签名条 */}
      <AnimatedEntrance>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
              {t('tabs.bookmarks')}
            </Text>
            {items.length > 0 && (
              <LinearGradient
                colors={[...Gradients.neon]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.countPill}>
                <Text style={styles.countText}>{items.length}</Text>
              </LinearGradient>
            )}
            {items.length > 0 && (
              <PressableScale
                onPress={handleClear}
                hitSlop={12}
                activeScale={0.9}
                style={[
                  styles.clearPill,
                  { backgroundColor: `${theme.danger}${DANGER_TINT_ALPHA}` },
                ]}>
                <Text style={[styles.clearText, { color: theme.danger }]}>
                  {t('common.clear')}
                </Text>
              </PressableScale>
            )}
          </View>
          <LinearGradient
            colors={[...Gradients.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerBar}
          />
        </View>
      </AnimatedEntrance>

      {isEmpty && (
        <EmptyState title={t('common.empty.title')} message={t('common.empty.message')} />
      )}

      {items.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          {items.map((item, index) => (
            <BookmarkRow
              key={item.id}
              item={item}
              isLast={index === items.length - 1}
              onPress={openTechnique}
            />
          ))}
        </View>
      )}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerTitle: {
    flexShrink: 1,
    fontSize: 28,
    fontWeight: '800',
  },
  countPill: {
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: ON_GRADIENT,
    fontVariant: ['tabular-nums'],
  },
  clearPill: {
    marginLeft: 'auto',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two + 4,
    paddingVertical: Spacing.two - 2,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
  },
  headerBar: {
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    marginTop: Spacing.two + 2,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowBody: {
    flex: 1,
    gap: Spacing.half,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 12,
  },
});
