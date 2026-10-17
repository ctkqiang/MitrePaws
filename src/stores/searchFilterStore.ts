/**
 * 搜索过滤条件存储 — 纯 UI 瞬时状态，不持久化。
 *
 * query 为搜索关键词；tacticFilter 为单条战术 id 筛选，null 表示全部战术。
 */

import { create } from 'zustand';

type SearchFilterState = {
  query: string;
  tacticFilter: string | null;
  setQuery: (query: string) => void;
  setTacticFilter: (tacticId: string | null) => void;
};

/**
 * 提供搜索关键词与战术过滤条件的存储。
 * 状态随会话结束丢弃，重启后恢复为默认值。
 */
export const useSearchFilterStore = create<SearchFilterState>()((set) => ({
  query: '',
  tacticFilter: null,
  setQuery: (query) => set({ query }),
  setTacticFilter: (tacticFilter) => set({ tacticFilter }),
}));
