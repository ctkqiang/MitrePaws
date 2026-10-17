/**
 * 设置页 — 语言、主题、字体缩放与关于信息。
 *
 * 视觉在豆包式「分组卡片」上叠加字节系签名：28/800 页头 + 40x4 品牌渐变
 * 签名条（Gradients.brand）；分段选择器升级为 backgroundSelected 轨道 +
 * accent 实底滑块（白字 700 + 微投影）；字体步进按钮改为品牌渐变圆钮；
 * 关于卡顶部新增霓虹渐变圆形头像位（Gradients.neon + PawIcon）。
 * 组内行高 52-56、行间 hairline 分隔的卡片语言保持不变。
 */

import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AnimatedEntrance } from '@/components/AnimatedEntrance';
import { PressableScale } from '@/components/PressableScale';
import { ScreenScaffold } from '@/components/ScreenScaffold';
import { PawIcon } from '@/components/icons/PawIcon';
import { SEED_MANIFEST } from '@/data/seed/manifest';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { haptics } from '@/services/haptics';
import {
    FONT_SIZE_DEFAULT,
    FONT_SIZE_MAX,
    FONT_SIZE_MIN,
    useFontScaleStore,
} from '@/stores/fontScaleStore';
import { useThemeStore, type ThemeMode } from '@/stores/themeStore';
import { Gradients, Radius, Spacing } from '@/theme/tokens';
import { useLocaleViewModel } from '@/viewmodels/useLocaleViewModel';

/** 展示用版本号 — 与 package.json 保持一致。 */
const APP_VERSION = 'v1.0.0';

/** 作者元信息 — 应用级常量，不属于 ATT&CK 内容。 */
const AUTHOR = {
  name: '钟智强 ctkqiang',
  email: 'johnmelodymel@qq.com',
  website: 'https://www.ctkqiang.xin',
} as const;

/** 渐变面上的前景固定白色 — 渐变底在双主题下均为深色底（与 tokens 约定一致）。 */
const ON_GRADIENT = '#FFFFFF';

/** 分段选择器的单个选项。 */
type SegmentOption<T extends string> = {
  /** 展示文案。 */
  label: string;
  /** 选项值。 */
  value: T;
};

/** 可选语言清单 — value 与 localeStore 的 Locale ('en' | 'zh') 对齐。 */
const LANGUAGES: readonly SegmentOption<'en' | 'zh'>[] = [
  { label: 'English', value: 'en' },
  { label: '简体中文', value: 'zh' },
];

/** 主题模式清单 — value 对应 store，labelKey 走 i18n。 */
const THEME_MODES: readonly {
  labelKey: 'settings.themeAuto' | 'settings.themeLight' | 'settings.themeDark';
  value: ThemeMode;
}[] = [
  { labelKey: 'settings.themeAuto', value: 'auto' },
  { labelKey: 'settings.themeLight', value: 'light' },
  { labelKey: 'settings.themeDark', value: 'dark' },
];

/** 分段选择器属性。 */
type SegmentedControlProps<T extends string> = {
  /** 选项清单。 */
  options: readonly SegmentOption<T>[];
  /** 当前选中值。 */
  value: T;
  /** 选中变化回调。 */
  onChange: (value: T) => void;
};

/**
 * 字节式分段选择器 — backgroundSelected 轨道内平铺选项，选中项以
 * accent 实底滑块落底（白字 700 + 微投影），未选中项为次级文本，
 * 保持克制。选中块固定 Radius.md，形成「滑块」般的圆角视感。
 *
 * @param props - 见 {@link SegmentedControlProps}。
 */
function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.segmentTrack, { backgroundColor: theme.backgroundSelected }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segmentOption,
              selected && [styles.segmentOptionActive, { backgroundColor: theme.accent }],
            ]}>
            <Text
              numberOfLines={1}
              style={[
                styles.segmentText,
                { color: selected ? ON_GRADIENT : theme.textSecondary },
                selected && styles.segmentTextActive,
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** 分组卡片属性。 */
type GroupCardProps = {
  /** 卡片内大节标题（仅「关于」这类独立章节使用）；缺省不渲染。 */
  title?: string;
  /** 卡片内容行。 */
  children: ReactNode;
};

/**
 * 分组卡片 — 豆包设置页的基本容器。
 *
 * 一张白卡承载一个功能域：Radius.lg 圆角 + hairline 描边 +
 * overflow hidden，让行按压态的 backgroundSelected 不溢出圆角。
 *
 * @param props - 见 {@link GroupCardProps}。
 */
function GroupCard({ title, children }: GroupCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      {title !== undefined && <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>}
      {children}
    </View>
  );
}

/** 设置行属性。 */
type GroupRowProps = {
  /** 左侧主标签。 */
  label: string;
  /** 可选次级说明文案。 */
  hint?: string;
  /** 是否为组内最后一行：决定是否绘制 hairline 分隔线。 */
  isLast?: boolean;
  /** 可选点击回调；提供时整行可按压并落 backgroundSelected 底色。 */
  onPress?: () => void;
  /** 可选右侧 accessory（值文本 / 控件）。 */
  accessory?: ReactNode;
};

/**
 * 设置行 — 左侧 15px 标签（可带说明），右侧值或箭头。
 *
 * 提供 onPress 时整行为 Pressable，按压态落 backgroundSelected；
 * 分隔线挂在行自身底部（末行除外），与豆包分组列表一致。
 *
 * @param props - 见 {@link GroupRowProps}。
 */
function GroupRow({ label, hint, isLast = false, onPress, accessory }: GroupRowProps) {
  const theme = useTheme();

  const body = (
    <>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, { color: theme.text }]} numberOfLines={1}>
          {label}
        </Text>
        {hint !== undefined && (
          <Text style={[styles.rowHint, { color: theme.textSecondary }]} numberOfLines={2}>
            {hint}
          </Text>
        )}
      </View>
      {accessory !== undefined && <View style={styles.rowRight}>{accessory}</View>}
    </>
  );

  if (onPress === undefined) {
    return (
      <View style={[styles.row, !isLast && styles.rowBorder, { borderBottomColor: theme.border }]}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        { borderBottomColor: theme.border },
        pressed && { backgroundColor: theme.backgroundSelected },
      ]}>
      {body}
    </Pressable>
  );
}

/** 设置页路由组件。 */
export default function SettingsScreen() {
  const t = useT();
  const theme = useTheme();
  const { locale, setLocale } = useLocaleViewModel();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  const fontSize = useFontScaleStore((s) => s.fontSize);
  const setFontSize = useFontScaleStore((s) => s.setFontSize);
  const resetFontSize = useFontScaleStore((s) => s.resetFontSize);

  const minusDisabled = fontSize <= FONT_SIZE_MIN;
  const plusDisabled = fontSize >= FONT_SIZE_MAX;
  const isDefaultSize = fontSize === FONT_SIZE_DEFAULT;

  /** 语言切换是确认操作：轻触感给用户一个落地反馈；同值重复点击不触发。 */
  const handleSelectLocale = (value: 'en' | 'zh') => {
    if (value !== locale) {
      haptics.lightImpact();
      setLocale(value);
    }
  };

  /** 主题切换同样是确认操作：轻触感 + 持久化；同值重复点击不触发。 */
  const handleSelectTheme = (value: ThemeMode) => {
    if (value !== themeMode) {
      haptics.lightImpact();
      setThemeMode(value);
    }
  };

  /** 字体调整步进：轻触感确认每次变化，越界时静默忽略。 */
  const handleFontStep = (delta: number) => {
    const next = fontSize + delta;
    if (next >= FONT_SIZE_MIN && next <= FONT_SIZE_MAX) {
      haptics.lightImpact();
      setFontSize(next);
    }
  };

  /** 重置字体为默认值；已是默认值时不做任何事。 */
  const handleFontReset = () => {
    if (fontSize !== FONT_SIZE_DEFAULT) {
      haptics.lightImpact();
      resetFontSize();
    }
  };

  /** 打开邮箱客户端（mailto 协议由系统分发）。 */
  const handleOpenEmail = () => {
    haptics.lightImpact();
    void Linking.openURL(`mailto:${AUTHOR.email}`);
  };

  /** 打开作者网站（外链交给系统浏览器）。 */
  const handleOpenWebsite = () => {
    haptics.lightImpact();
    void Linking.openURL(AUTHOR.website);
  };

  return (
    <ScreenScaffold scroll>
      {/* 字节式页头：大标题 + 品牌渐变签名条 */}
      <AnimatedEntrance>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {t('settings.title')}
          </Text>
          <LinearGradient
            colors={[...Gradients.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerBar}
          />
        </View>
      </AnimatedEntrance>

      {/* 语言 */}
      <AnimatedEntrance delay={60} style={styles.groupGap}>
        <GroupCard>
          <GroupRow label={t('settings.language')} hint={t('settings.languageHint')} isLast />
          <View style={styles.segmentRow}>
            <SegmentedControl options={LANGUAGES} value={locale} onChange={handleSelectLocale} />
          </View>
        </GroupCard>
      </AnimatedEntrance>

      {/* 主题 */}
      <AnimatedEntrance delay={110} style={styles.groupGap}>
        <GroupCard>
          <GroupRow label={t('settings.theme')} hint={t('settings.themeHint')} isLast />
          <View style={styles.segmentRow}>
            <SegmentedControl
              options={THEME_MODES.map((mode) => ({ label: t(mode.labelKey), value: mode.value }))}
              value={themeMode}
              onChange={handleSelectTheme}
            />
          </View>
        </GroupCard>
      </AnimatedEntrance>

      {/* 字体大小 */}
      <AnimatedEntrance delay={160} style={styles.groupGap}>
        <GroupCard>
          <GroupRow
            label={t('settings.fontSize')}
            hint={t('settings.fontSizeHint')}
            accessory={
              <PressableScale
                onPress={handleFontReset}
                disabled={isDefaultSize}
                activeScale={0.94}
                accessibilityState={{ disabled: isDefaultSize }}
                style={[
                  styles.resetPill,
                  {
                    backgroundColor: isDefaultSize ? 'transparent' : theme.accentSoft,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: isDefaultSize ? theme.border : 'transparent',
                  },
                ]}>
                <Text
                  style={[
                    styles.resetText,
                    { color: isDefaultSize ? theme.textSecondary : theme.accent },
                  ]}>
                  {t('settings.fontSizeReset')}
                </Text>
              </PressableScale>
            }
          />

          <View style={styles.fontControl}>
            <PressableScale
              onPress={() => handleFontStep(-1)}
              disabled={minusDisabled}
              activeScale={0.9}
              accessibilityState={{ disabled: minusDisabled }}
              style={{ opacity: minusDisabled ? 0.35 : 1 }}>
              <LinearGradient
                colors={[...Gradients.brand]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.stepButton}>
                <Text style={styles.stepText}>−</Text>
              </LinearGradient>
            </PressableScale>

            <View style={styles.fontDisplay}>
              <Text style={[styles.fontValue, { color: theme.text }]}>{fontSize}</Text>
              <Text style={[styles.fontUnit, { color: theme.textSecondary }]}>px</Text>
            </View>

            <PressableScale
              onPress={() => handleFontStep(1)}
              disabled={plusDisabled}
              activeScale={0.9}
              accessibilityState={{ disabled: plusDisabled }}
              style={{ opacity: plusDisabled ? 0.35 : 1 }}>
              <LinearGradient
                colors={[...Gradients.brand]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.stepButton}>
                <Text style={styles.stepText}>+</Text>
              </LinearGradient>
            </PressableScale>
          </View>

          <View
            style={[styles.fontPreview, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={[styles.fontPreviewTitle, { color: theme.text, fontSize }]}>
              {t('settings.fontPreviewTitle')}
            </Text>
            <Text
              style={[
                {
                  color: theme.textSecondary,
                  fontSize: Math.round(fontSize * 0.85),
                  lineHeight: Math.round(fontSize * 0.85 * 1.5),
                },
              ]}>
              {t('settings.fontPreviewBody')}
            </Text>
          </View>
        </GroupCard>
      </AnimatedEntrance>

      {/* 关于 */}
      <AnimatedEntrance delay={210} style={styles.groupGap}>
        <GroupCard title={t('settings.about')}>
          {/* 作者头像位：霓虹渐变圆 + 白色肉爪，作者名 15/700 */}
          <View style={[styles.profileRow, { borderBottomColor: theme.border }]}>
            <LinearGradient
              colors={[...Gradients.neon]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}>
              <PawIcon size={24} color={ON_GRADIENT} />
            </LinearGradient>
            <View style={styles.profileBody}>
              <Text style={[styles.profileName, { color: theme.text }]} numberOfLines={1}>
                {AUTHOR.name}
              </Text>
            </View>
          </View>
          <GroupRow
            label="MitrePaws"
            accessory={
              <Text style={[styles.rowValue, { color: theme.textSecondary }]}>{APP_VERSION}</Text>
            }
          />
          <GroupRow
            label={t('settings.dataset')}
            accessory={
              <Text style={[styles.rowValue, { color: theme.textSecondary }]} numberOfLines={1}>
                {SEED_MANIFEST.attackRelease}
              </Text>
            }
          />
          <GroupRow
            label={t('settings.email')}
            onPress={handleOpenEmail}
            accessory={
              <Text style={[styles.rowValue, { color: theme.accent }]} numberOfLines={1}>
                {AUTHOR.email}
              </Text>
            }
          />
          <GroupRow
            label={t('settings.website')}
            onPress={handleOpenWebsite}
            accessory={
              <Text style={[styles.rowValue, { color: theme.accent }]} numberOfLines={1}>
                {AUTHOR.website}
              </Text>
            }
          />
          <View style={styles.attributionBlock}>
            <Text style={[styles.attributionLabel, { color: theme.textSecondary }]}>
              {t('settings.attribution')}
            </Text>
            <Text style={[styles.attributionBody, { color: theme.textSecondary }]}>
              {t('settings.attributionBody')}
            </Text>
          </View>
        </GroupCard>
      </AnimatedEntrance>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.four,
  },
  headerTitle: {
    flexShrink: 1,
    fontSize: 28,
    fontWeight: '800',
  },
  headerBar: {
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    marginTop: Spacing.two + 2,
  },
  groupGap: {
    marginBottom: Spacing.three,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBody: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
  },
  row: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flex: 1,
    gap: Spacing.half,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowHint: {
    fontSize: 12,
  },
  rowRight: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowValue: {
    fontSize: 14,
    textAlign: 'right',
  },
  segmentRow: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two + 2,
    paddingBottom: Spacing.three,
  },
  segmentTrack: {
    flexDirection: 'row',
    gap: Spacing.half,
    padding: Spacing.half,
    borderRadius: Radius.md,
  },
  segmentOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two - 1,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
  },
  segmentOptionActive: {
    // 微投影：按字节规格固定黑色 20%、模糊 6；Android 以 elevation 呈现
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    fontWeight: '700',
  },
  resetPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fontControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '600',
    color: ON_GRADIENT,
  },
  fontDisplay: {
    alignItems: 'center',
  },
  fontValue: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
    fontVariant: ['tabular-nums'],
  },
  fontUnit: {
    fontSize: 12,
    marginTop: Spacing.half,
  },
  fontPreview: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fontPreviewTitle: {
    fontWeight: '600',
  },
  attributionBlock: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two + 4,
    paddingBottom: Spacing.three,
    gap: Spacing.one,
  },
  attributionLabel: {
    fontSize: 13,
  },
  attributionBody: {
    fontSize: 12,
    lineHeight: 19,
  },
});
