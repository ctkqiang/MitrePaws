/**
 * 技术详情视图模型 — 查询技术详情并暴露书签 toggle 动作。
 *
 * 技术未命中时返回 error 状态，渲染侧据此显示空态。
 */

import { useCallback, useMemo } from 'react';

import { useT } from '@/i18n';
import * as techniqueRepository from '@/models/repositories/techniqueRepository';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import type { AsyncResource } from '@/types/asyncResource';
import type { TechniqueDetailViewData } from '@/types/viewData';

export function useTechniqueDetailViewModel(
  id: string,
): AsyncResource<TechniqueDetailViewData> & { onToggleBookmark: () => void } {
  const bookmarkIds = useBookmarkStore((s) => s.ids);
  const toggle = useBookmarkStore((s) => s.toggle);
  const t = useT();

  const resource = useMemo<AsyncResource<TechniqueDetailViewData>>(() => {
    const data = techniqueRepository.detail(id, bookmarkIds);
    if (data === null) {
      return { status: 'error', message: t('common.error') };
    }
    return { status: 'ready', data };
  }, [id, bookmarkIds, t]);

  const onToggleBookmark = useCallback(() => toggle(id), [toggle, id]);

  if (resource.status === 'ready') {
    return { status: 'ready', data: resource.data, onToggleBookmark };
  }
  if (resource.status === 'error') {
    return { status: 'error', message: resource.message, onToggleBookmark };
  }
  return { status: 'loading', onToggleBookmark };
}
