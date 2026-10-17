/**
 * 语言状态存储 — 当前界面/内容语言。
 *
 * 默认中文，通过 Zustand persist + AsyncStorage 持久化。
 * 语言切换须在下一次提交即生效，不触发重挂载。
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Locale } from '@/types/stix';

/** 持久化键。 */
export const LOCALE_STORAGE_KEY = 'mitrepaws.v1.locale';

/** 默认语言。 */
export const DEFAULT_LOCALE: Locale = 'zh';

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

/** 提供 locale 状态与 setLocale 动作的语言存储。 */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    { name: LOCALE_STORAGE_KEY, storage: createJSONStorage(() => AsyncStorage) },
  ),
);
