/**
 * 技术列表视图模型 — 监听书签变化并返回带书签标记的技术列表行。
 */

import { useMemo } from 'react';

import * as techniqueRepository from '@/models/repositories/techniqueRepository';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import type { AsyncResource } from '@/types/asyncResource';
import type { TechniqueListItem } from '@/types/viewData';

export function useTechniqueListViewModel(): AsyncResource<TechniqueListItem[]> {
  const bookmarkIds = useBookmarkStore((s) => s.ids);
  return useMemo<AsyncResource<TechniqueListItem[]>>(
    () => ({ status: 'ready', data: techniqueRepository.listItems(bookmarkIds) }),
    [bookmarkIds],
  );
}
