/**
 * 语言视图模型 — 向视图层暴露当前语言、切换动作与翻译函数。
 */

import { useT } from '@/i18n';
import { useLocaleStore } from '@/stores/localeStore';
import type { Locale } from '@/types/stix';
import type { TranslationKey } from '@/i18n';

/** 语言视图模型的返回形状。 */
export type LocaleViewModel = {
  /** 当前语言。 */
  locale: Locale;
  /** 切换语言。 */
  setLocale: (locale: Locale) => void;
  /** 取文案函数。 */
  t: (key: TranslationKey) => string;
};

export function useLocaleViewModel(): LocaleViewModel {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const t = useT();
  return { locale, setLocale, t };
}
