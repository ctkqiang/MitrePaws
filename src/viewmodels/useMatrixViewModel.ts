/**
 * 矩阵视图模型 — 同步构建 ATT&CK 矩阵列，结果缓存在 useMemo 中。
 */

import { useMemo } from 'react';

import * as techniqueRepository from '@/models/repositories/techniqueRepository';
import type { AsyncResource } from '@/types/asyncResource';
import type { MatrixColumn } from '@/types/viewData';

export function useMatrixViewModel(): AsyncResource<MatrixColumn[]> {
  return useMemo<AsyncResource<MatrixColumn[]>>(
    () => ({ status: 'ready', data: techniqueRepository.matrixColumns() }),
    [],
  );
}
