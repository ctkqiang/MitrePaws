/**
 * 技术详情页 — 豆包式设计语言：页面底色 + 纯白大圆角卡片流，
 * 完整还原 MITRE ATT&CK 官网全部信息区块：
 * 概述、检测、检测策略（含分析项与日志源）、平台、战术、父技术、
 * 子技术、使用方、攻击过程示例、缓解措施、数据源、
 * 元信息（版本 / 时间 / 远程支持 / 影响类型 / 贡献者）、CAPEC、外部引用。
 * 只重排样式与排版，数据字段与官网一一对应，一个不丢。
 */

import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { AnimatedEntrance } from '@/components/AnimatedEntrance';
import { BilingualText } from '@/components/BilingualText';
import { DetailSection } from '@/components/detail/DetailSection';
import { EmptyState } from '@/components/EmptyState';
import { ChevronLeftIcon } from '@/components/icons/ChevronLeftIcon';
import { StarIcon } from '@/components/icons/StarIcon';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { PressableScale } from '@/components/PressableScale';
import { RelationshipChip } from '@/components/RelationshipChip';
import { ScreenScaffold } from '@/components/ScreenScaffold';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { haptics } from '@/services/haptics';
import { useLocaleStore } from '@/stores/localeStore';
import { Gradients, Radius, Spacing } from '@/theme/tokens';
import type { BilingualText as BilingualTextValue, Locale } from '@/types/stix';
import { pickLocaleText } from '@/types/viewData';
import { useTechniqueDetailViewModel } from '@/viewmodels/useTechniqueDetailViewModel';

/** 中性芯片行属性 — 平台 / CAPEC 这类短枚举值的展示载体。 */
type ChipRowProps = {
  /** 芯片文案列表。 */
  labels: string[];
  /** 色调：neutral 走 backgroundSelected + 正文色，accent 走 accentSoft + 品牌色。 */
  tone: 'neutral' | 'accent';
};

/** 元信息键值行属性。 */
type MetadataRowProps = {
  /** 键（如「版本」）。 */
  label: string;
  /** 值（右对齐，可换行）。 */
  value: string;
};

/**
 * 计算标题副行 — 展示与当前界面语言相对的另一种语言写法。
 *
 * 主标题已跟随界面语言，副行补上对侧语言后中英名称同屏互为对照，
 * 比重复主标题更有信息量，也让双语语料的价值在详情页可见。
 */
function subtitleOf(name: BilingualTextValue, locale: Locale): string {
  return locale === 'zh' ? name.en : name.zh;
}

/**
 * 把 ISO 8601 时间串格式化为用户本地日期。
 *
 * 官网元信息以 ISO 串提供，直接展示对用户不可读；
 * 交给运行时 locale 感知的 toLocaleDateString，与系统语言保持一致。
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

/**
 * 压缩检测策略编号 — 种子中策略 id 兼容 STIX UUID 与官方编号两种形态；
 * UUID 场景取横杠后首段前 8 位做短码，官方编号（如 DET0516）原样返回，
 * 避免把冗长的机器 id 直接怼进 UI。
 */
function shortStrategyId(id: string): string {
  const parts = id.split('--');
  return parts.length > 1 ? parts[1]!.slice(0, 8) : id;
}

/**
 * 中性芯片行 — 把短枚举值排成 pill 胶囊流。
 *
 * 逗号长句在移动端难以扫读，胶囊化让平台、数据源、CAPEC
 * 在卡片内拥有一致的视觉节奏，也更容易被目光分组。
 */
function ChipRow({ labels, tone }: ChipRowProps) {
  const theme = useTheme();
  const backgroundColor = tone === 'accent' ? theme.accentSoft : theme.backgroundSelected;
  const color = tone === 'accent' ? theme.accent : theme.text;
  return (
    <View style={styles.chipWrap}>
      {labels.map((label, index) => (
        <View key={`${label}-${index}`} style={[styles.chip, { backgroundColor }]}>
          <Text style={[styles.chipText, { color }]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * 元信息键值行 — 官网元信息表的移动端等价物。
 *
 * 键左值右的行式布局比嵌套卡片省纵向空间，长值（贡献者名单）
 * 允许换行且始终右对齐，保证表格语义不因内容长度而崩坏。
 */
function MetadataRow({ label, value }: MetadataRowProps) {
  const theme = useTheme();
  return (
    <View style={styles.metadataRow}>
      <Text style={[styles.metadataLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.metadataValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

/** 技术详情页路由组件。 */
export default function TechniqueDetailScreen() {
  const t = useT();
  const theme = useTheme();
  const locale = useLocaleStore((s) => s.locale);
  const { id } = useLocalSearchParams<{ id: string }>();
  const resource = useTechniqueDetailViewModel(id ?? '');

  /** 书签切换：先给一下轻触感确认，再走视图模型的状态变更。 */
  const handleToggleBookmark = useCallback(() => {
    haptics.lightImpact();
    resource.onToggleBookmark();
  }, [resource]);

  /** 打开外部引用链接；跳转浏览器属于系统行为，不叠加触感反馈。 */
  const handleOpenUrl = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  // 未命中 / 加载中提前返回，让主渲染分支无需再判空。
  if (resource.status === 'loading') {
    return (
      <ScreenScaffold scroll>
        <LoadingSkeleton />
      </ScreenScaffold>
    );
  }
  if (resource.status === 'error') {
    return (
      <ScreenScaffold scroll>
        <EmptyState title={t('common.error')} message={resource.message} />
      </ScreenScaffold>
    );
  }

  const data = resource.data;

  return (
    <ScreenScaffold scroll>
      {/* 整页仅此一处轻量淡入，区块本身不再逐个挂动画，保持豆包式的静 */}
      <AnimatedEntrance>
        {/* 返回导航 — 交互保持既有实现 */}
        <PressableScale
          onPress={() => router.back()}
          accessibilityLabel={t('tabs.techniques')}
          activeScale={0.95}
          style={styles.backRow}>
          <ChevronLeftIcon size={20} color={theme.textSecondary} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>
            {t('tabs.techniques')}
          </Text>
        </PressableScale>

        {/* 顶部胶囊行：ID 徽章 + 状态标签 + 书签 */}
        <View style={styles.headerRow}>
          <LinearGradient
            colors={[...Gradients.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.idPill}>
            <Text style={styles.idPillText}>{data.externalId}</Text>
          </LinearGradient>
          {data.revoked && (
            <View style={[styles.statusBadge, { backgroundColor: theme.danger }]}>
              <Text style={[styles.statusBadgeText, { color: theme.onColor }]}>
                {t('detail.badge.revoked')}
              </Text>
            </View>
          )}
          {data.deprecated && (
            <View style={[styles.statusBadge, { backgroundColor: theme.warning }]}>
              <Text style={[styles.statusBadgeText, { color: theme.onColor }]}>
                {t('detail.badge.deprecated')}
              </Text>
            </View>
          )}
          <PressableScale
            onPress={handleToggleBookmark}
            activeScale={0.94}
            accessibilityState={{ selected: data.isBookmarked }}
            style={[
              styles.bookmarkBtn,
              { backgroundColor: data.isBookmarked ? theme.accent : theme.accentSoft },
            ]}>
            <AnimatedEntrance key={String(data.isBookmarked)} offset={0} scaleFrom={0.4}>
              <StarIcon
                size={14}
                filled={data.isBookmarked}
                color={data.isBookmarked ? theme.onAccent : theme.accent}
              />
            </AnimatedEntrance>
            <Text
              style={{
                color: data.isBookmarked ? theme.onAccent : theme.accent,
              }}>
              {data.isBookmarked ? t('common.bookmarked') : t('common.addBookmark')}
            </Text>
          </PressableScale>
        </View>

        {/* 标题 + 对侧语言副标题 */}
        <BilingualText text={data.name} style={[styles.title, { color: theme.text }]} />
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {subtitleOf(data.name, locale)}
        </Text>

        {/* 概述 — Hero 卡 */}
        <DetailSection title={t('detail.sections.overview')} hero>
          <BilingualText text={data.description} style={[styles.body, { color: theme.text }]} />
        </DetailSection>
      </AnimatedEntrance>

      {/* 检测 */}
      {data.detection && (
        <DetailSection title={t('detail.sections.detection')} entranceDelay={40}>
          <BilingualText text={data.detection} style={[styles.body, { color: theme.text }]} />
        </DetailSection>
      )}

      {/* 检测策略 — 含分析项与日志源 */}
      {data.detectionStrategies.length > 0 && (
        <DetailSection title={t('detail.sections.detectionStrategies')} entranceDelay={80}>
            <View style={styles.itemList}>
              {data.detectionStrategies.map((strategy) => (
                <View
                  key={strategy.id}
                  style={[
                    styles.nestedCard,
                    { backgroundColor: theme.background, borderColor: theme.border },
                  ]}>
                  <View style={styles.strategyHeader}>
                    <Text style={[styles.strategyId, { color: theme.accent }]}>
                      {shortStrategyId(strategy.id)}
                    </Text>
                    <BilingualText text={strategy.name} style={[styles.strategyName, { color: theme.text }]} />
                  </View>
                  {strategy.description.en !== '' && (
                    <BilingualText
                      text={strategy.description}
                      style={[styles.nestedBody, { color: theme.textSecondary }]}
                    />
                  )}
                  {strategy.analytics.map((analytic) => (
                    <View
                      key={analytic.id}
                      style={[
                        styles.analyticCard,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                      ]}>
                      <Text style={[styles.nestedLabel, { color: theme.textSecondary }]}>
                        {t('detail.strategy.analytics')}
                      </Text>
                      <BilingualText text={analytic.name} style={[styles.analyticName, { color: theme.text }]} />
                      {analytic.description.en !== '' && (
                        <BilingualText
                          text={analytic.description}
                          style={[styles.nestedBody, { color: theme.textSecondary }]}
                        />
                      )}
                      {analytic.platforms.length > 0 && (
                        <Text style={[styles.analyticPlatforms, { color: theme.textSecondary }]}>
                          {analytic.platforms.join(' · ')}
                        </Text>
                      )}
                      {analytic.logSources.length > 0 && (
                        <>
                          <Text style={[styles.nestedLabel, { color: theme.textSecondary }]}>
                            {t('detail.strategy.logSources')}
                          </Text>
                          <View style={styles.tagWrap}>
                            {analytic.logSources.map((ls, idx) => {
                              const lsName = pickLocaleText(ls.name, locale);
                              return (
                                <View
                                  key={`${ls.name.en}-${idx}`}
                                  style={[styles.tag, { backgroundColor: theme.accentSoft }]}>
                                  <Text style={[styles.tagText, { color: theme.accent }]}>
                                    {ls.channel ? `${lsName}: ${ls.channel}` : lsName}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        </>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </DetailSection>
        )}

        {/* 平台 */}
        <DetailSection title={t('detail.sections.platforms')} entranceDelay={120}>
          <ChipRow labels={data.platforms} tone="neutral" />
        </DetailSection>

        {/* 战术 */}
        <DetailSection title={t('detail.sections.tactics')} entranceDelay={160}>
          <View style={styles.chipWrap}>
            {data.tactics.map((ta) => (
              <RelationshipChip key={ta.externalId} externalId={ta.externalId} name={ta.name} kind="tactic" />
            ))}
          </View>
        </DetailSection>

        {/* 父技术 */}
        {data.parent && (
          <DetailSection title={t('detail.sections.parent')} entranceDelay={200}>
            <RelationshipChip
              externalId={data.parent.externalId}
              name={data.parent.name}
              kind="technique"
              onPress={() =>
                router.push({
                  pathname: '/techniques/[id]',
                  params: { id: data.parent!.externalId },
                })
              }
            />
          </DetailSection>
        )}

        {/* 子技术 */}
        {data.subtechniques.length > 0 && (
          <DetailSection title={t('detail.sections.subtechniques')} entranceDelay={240}>
            <View style={styles.chipWrap}>
              {data.subtechniques.map((sub) => (
                <RelationshipChip
                  key={sub.externalId}
                  externalId={sub.externalId}
                  name={sub.name}
                  kind="technique"
                  onPress={() =>
                    router.push({
                      pathname: '/techniques/[id]',
                      params: { id: sub.externalId },
                    })
                  }
                />
              ))}
            </View>
          </DetailSection>
        )}

        {/* 使用方 */}
        {data.usedBy.length > 0 && (
          <DetailSection title={t('detail.sections.usedBy')} entranceDelay={280}>
            <View style={styles.chipWrap}>
              {data.usedBy.map((u) => (
                <RelationshipChip
                  key={u.externalId}
                  externalId={u.externalId}
                  name={u.name}
                  kind={u.kind}
                />
              ))}
            </View>
          </DetailSection>
        )}

        {/* 攻击过程示例（Procedure Examples — 使用中的软件/组织） */}
        {data.procedureExamples.length > 0 && (
          <DetailSection title={t('detail.sections.procedureExamples')} entranceDelay={320}>
            <View style={styles.itemList}>
              {data.procedureExamples.map((pe, index) => (
                <View
                  key={`${pe.externalId}-${index}`}
                  style={[
                    styles.nestedCard,
                    { backgroundColor: theme.background, borderColor: theme.border },
                  ]}>
                  <RelationshipChip externalId={pe.externalId} name={pe.name} kind={pe.kind} />
                  <Text style={[styles.nestedBody, { color: theme.textSecondary }]}>
                    {pe.description}
                  </Text>
                </View>
              ))}
            </View>
          </DetailSection>
        )}

        {/* 缓解措施 */}
        {data.mitigations.length > 0 && (
          <DetailSection title={t('detail.sections.mitigations')} entranceDelay={360}>
            <View style={styles.chipWrap}>
              {data.mitigations.map((m) => (
                <RelationshipChip
                  key={m.externalId}
                  externalId={m.externalId}
                  name={m.name}
                  kind="mitigation"
                />
              ))}
            </View>
          </DetailSection>
        )}

        {/* 数据源 */}
        {data.dataComponents.length > 0 && (
          <DetailSection title={t('detail.sections.dataSources')} entranceDelay={400}>
            <ChipRow
              tone="accent"
              labels={data.dataComponents.map((dc) =>
                dc.dataSourceName ? `${dc.dataSourceName}: ${dc.componentName}` : dc.componentName,
              )}
            />
          </DetailSection>
        )}

        {/* CAPEC 关联 */}
        {data.capecIds.length > 0 && (
          <DetailSection title={t('detail.sections.capec')} entranceDelay={440}>
            <ChipRow labels={data.capecIds} tone="accent" />
          </DetailSection>
        )}

        {/* 元信息 — 版本 / 时间 / 远程支持 / 影响类型 / 贡献者 */}
        <DetailSection title={t('detail.sections.metadata')} entranceDelay={480}>
          <View style={styles.metadataList}>
            {data.version && (
              <MetadataRow label={t('detail.metadata.version')} value={data.version} />
            )}
            {data.created && (
              <MetadataRow
                label={t('detail.metadata.created')}
                value={formatDate(data.created)}
              />
            )}
            {data.modified && (
              <MetadataRow
                label={t('detail.metadata.modified')}
                value={formatDate(data.modified)}
              />
            )}
            {data.remoteSupport !== null && (
              <MetadataRow
                label={t('detail.sections.remoteSupport')}
                value={
                  data.remoteSupport
                    ? t('detail.metadata.remoteSupportYes')
                    : t('detail.metadata.remoteSupportNo')
                }
              />
            )}
            {data.impactType.length > 0 && (
              <MetadataRow
                label={t('detail.sections.impactType')}
                value={data.impactType.join(' · ')}
              />
            )}
            {data.contributors.length > 0 && (
              <MetadataRow
                label={t('detail.sections.contributors')}
                value={data.contributors.join(' · ')}
              />
            )}
          </View>
        </DetailSection>

        {/* 外部引用 */}
        {data.references.length > 0 && (
          <DetailSection title={t('detail.sections.references')} entranceDelay={520}>
            <View style={styles.itemList}>
              {data.references.map((ref, index) => (
                <PressableScale
                  key={`${ref.sourceName}-${index}`}
                  onPress={() => {
                    if (ref.url) handleOpenUrl(ref.url);
                  }}
                  activeScale={0.98}
                  style={[
                    styles.referenceRow,
                    { backgroundColor: theme.background, borderColor: theme.border },
                  ]}>
                  <Text style={[styles.referenceTitle, { color: theme.accent }]}>
                    {ref.sourceName}
                  </Text>
                  {ref.description && (
                    <Text style={[styles.nestedBody, { color: theme.textSecondary }]}>
                      {ref.description}
                    </Text>
                  )}
                  {ref.url && (
                    <Text
                      style={[styles.referenceUrl, { color: theme.accent }]}
                      numberOfLines={1}>
                      {ref.url}
                    </Text>
                  )}
                </PressableScale>
              ))}
            </View>
          </DetailSection>
        )}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    alignSelf: 'flex-start',
    marginBottom: Spacing.three,
    paddingVertical: Spacing.one,
    paddingRight: Spacing.two,
  },
  backText: {
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  idPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  idPillText: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  statusBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bookmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    marginLeft: 'auto',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: Spacing.one,
    marginBottom: Spacing.four,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  itemList: {
    gap: Spacing.two,
  },
  nestedCard: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  nestedLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  nestedBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  strategyId: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  strategyName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  analyticCard: {
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.two,
    gap: Spacing.one + 2,
  },
  analyticName: {
    fontSize: 14,
    fontWeight: '600',
  },
  analyticPlatforms: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  tag: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half + 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metadataList: {
    gap: Spacing.two + 2,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  metadataLabel: {
    fontSize: 13,
    lineHeight: 19,
    paddingTop: 1,
  },
  metadataValue: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 1,
    fontVariant: ['tabular-nums'],
  },
  referenceRow: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.two,
    gap: Spacing.one,
  },
  referenceTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  referenceUrl: {
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
