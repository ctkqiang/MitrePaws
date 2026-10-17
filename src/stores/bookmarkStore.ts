/**
 * 书签状态存储 — 用户收藏的外部编号列表。
 *
 * 纯函数 isBookmarked 不依赖 hook，可在仓储层直接调用，避免模型层 import React。
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** 持久化键。 */
export const BOOKMARK_STORAGE_KEY = 'mitrepaws.v1.bookmarks';

type BookmarkState = {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
};

/**
 * 判断给定外部编号是否已加入书签。
 *
 * @param {readonly string[]} ids - 当前书签 id 列表。
 * @param {string} id - 待判断的外部编号。
 * @returns {boolean} 已加入时返回 true。
 *
 * @example
 * isBookmarked(store.ids, 'T1059.001');
 */
export const isBookmarked = (ids: readonly string[], id: string): boolean => ids.includes(id);

/**
 * 提供书签 id 列表、toggle 动作与清空动作的存储。
 * toggle 为幂等操作：已加入则移除，未加入则追加。
 */
export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) =>
          isBookmarked(state.ids, id)
            ? { ids: state.ids.filter((x) => x !== id) }
            : { ids: [...state.ids, id] },
        ),
      clear: () => set({ ids: [] }),
    }),
    { name: BOOKMARK_STORAGE_KEY, storage: createJSONStorage(() => AsyncStorage) },
  ),
);
