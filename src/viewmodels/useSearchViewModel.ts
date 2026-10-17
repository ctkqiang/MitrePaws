/**
 * 搜索视图模型 — 对 query 与 locale 做 150ms debounce，返回命中结果。
 */

import { useEffect, useMemo, useState } from 'react';

import { useLocaleStore } from '@/stores/localeStore';
import { useSearchFilterStore } from '@/stores/searchFilterStore';
import * as searchService from '@/services/searchService';
import type { SearchHit } from '@/types/viewData';

export function useSearchViewModel() {
  const query = useSearchFilterStore((s) => s.query);
  const setQuery = useSearchFilterStore((s) => s.setQuery);
  const tacticFilter = useSearchFilterStore((s) => s.tacticFilter);
  const setTacticFilter = useSearchFilterStore((s) => s.setTacticFilter);
  const locale = useLocaleStore((s) => s.locale);

  const [hits, setHits] = useState<SearchHit[]>([]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (query.trim().length === 0) {
        setHits([]);
        return;
      }
      setHits(searchService.search(query, locale, tacticFilter));
    }, 150);
    return () => clearTimeout(handle);
  }, [query, locale, tacticFilter]);

  return useMemo(
    () => ({
      query,
      setQuery,
      hits,
      tacticFilter,
      setTacticFilter,
    }),
    [query, setQuery, hits, tacticFilter, setTacticFilter],
  );
}
