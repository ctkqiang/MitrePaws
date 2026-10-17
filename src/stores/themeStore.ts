/**
 * 主题状态存储 — 用户选择的主题模式。
 *
 * 三态：auto（跟随系统）/ light / dark，默认 auto。
 * 通过 Zustand persist + AsyncStorage 持久化；切换即时生效，不触发重挂载。
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** 主题模式：auto 跟随系统，light/dark 强制覆盖。 */
export type ThemeMode = 'auto' | 'light' | 'dark';

/** 持久化键。 */
export const THEME_STORAGE_KEY = 'mitrepaws.v1.theme';

/** 默认主题模式：跟随系统。 */
export const DEFAULT_THEME_MODE: ThemeMode = 'auto';

type ThemeState = {
  /** 当前主题模式。 */
  mode: ThemeMode;
  /** 设置主题模式。 */
  setMode: (mode: ThemeMode) => void;
};

/** 提供主题模式状态与 setMode 动作的主题存储。 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: DEFAULT_THEME_MODE,
      setMode: (mode) => set({ mode }),
    }),
    { name: THEME_STORAGE_KEY, storage: createJSONStorage(() => AsyncStorage) },
  ),
);
