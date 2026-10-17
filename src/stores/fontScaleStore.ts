/**
 * 字体缩放状态存储 — 用户自定义的全局字体基准大小。
 *
 * 范围 10-30，默认 14。通过 Zustand persist + AsyncStorage 持久化。
 * 全应用文本通过 useFontScale 钩子读取缩放因子，实时生效。
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** 字体大小范围。 */
export const FONT_SIZE_MIN = 10;
export const FONT_SIZE_MAX = 30;
export const FONT_SIZE_DEFAULT = 14;

/** 持久化键。 */
export const FONT_SCALE_STORAGE_KEY = 'mitrepaws.v1.fontSize';

type FontScaleState = {
  /** 当前字体基准大小（10-30）。 */
  fontSize: number;
  /** 设置字体大小，自动截断到有效范围。 */
  setFontSize: (size: number) => void;
  /** 恢复默认大小。 */
  resetFontSize: () => void;
};

/** 提供字体缩放状态与操作。 */
export const useFontScaleStore = create<FontScaleState>()(
  persist(
    (set) => ({
      fontSize: FONT_SIZE_DEFAULT,
      setFontSize: (size) =>
        set({ fontSize: Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, Math.round(size))) }),
      resetFontSize: () => set({ fontSize: FONT_SIZE_DEFAULT }),
    }),
    { name: FONT_SCALE_STORAGE_KEY, storage: createJSONStorage(() => AsyncStorage) },
  ),
);
