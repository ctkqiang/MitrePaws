/**
 * 书签视图模型 — 从书签 id 反查技术并组装为书签行数据。
 */

import { useMemo } from 'react';

import * as tacticRepository from '@/models/repositories/tacticRepository';
import * as techniqueRepository from '@/models/repositories/techniqueRepository';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import type { AsyncResource } from '@/types/asyncResource';
import type { Technique } from '@/types/stix';
import type { BookmarkItem } from '@/types/viewData';

export function useBookmarksViewModel(): AsyncResource<BookmarkItem[]> {
  const bookmarkIds = useBookmarkStore((s) => s.ids);
  return useMemo<AsyncResource<BookmarkItem[]>>(() => {
    const data: BookmarkItem[] = bookmarkIds
      .map((id) => techniqueRepository.byId(id))
      .filter((t): t is Technique => t !== null)
      .map((t) => {
        const firstTacticId = t.tacticIds[0];
        const tactic = firstTacticId === undefined ? null : tacticRepository.byId(firstTacticId);
        return {
          id: t.id,
          externalId: t.externalId,
          name: t.name,
          tacticShortname: tactic?.shortname ?? null,
        };
      });
    return { status: 'ready', data };
  }, [bookmarkIds]);
}
