/**
 * 底部标签描述表 — 用查找表描述五个标签，替代散落的 JSX 配置。
 */

import type { ComponentType } from 'react';

import { BookmarkIcon } from '@/components/icons/BookmarkIcon';
import { LayersIcon } from '@/components/icons/LayersIcon';
import { MatrixIcon } from '@/components/icons/MatrixIcon';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { SettingsIcon } from '@/components/icons/SettingsIcon';
import type { TranslationKey } from '@/i18n';

/** 单个标签的静态描述。 */
export type TabItem = {
  /** expo-router 触发器名称，须与 (tabs) 目录路由对应。 */
  name: 'matrix' | 'techniques' | 'search' | 'bookmarks' | 'settings';
  /** 路由 href；首页矩阵用 '/'。 */
  href: '/' | '/techniques' | '/search' | '/bookmarks' | '/settings';
  /** 界面字典键。 */
  labelKey: TranslationKey;
  /** 图标组件（颜色由 TabBarButton 按选中态注入）。 */
  Icon: ComponentType<{ size: number; color: string }>;
};

/** 底部标签顺序定义。 */
export const TAB_ITEMS: readonly TabItem[] = [
  { name: 'matrix', href: '/', labelKey: 'tabs.matrix', Icon: MatrixIcon },
  { name: 'techniques', href: '/techniques', labelKey: 'tabs.techniques', Icon: LayersIcon },
  { name: 'search', href: '/search', labelKey: 'tabs.search', Icon: SearchIcon },
  { name: 'bookmarks', href: '/bookmarks', labelKey: 'tabs.bookmarks', Icon: BookmarkIcon },
  { name: 'settings', href: '/settings', labelKey: 'tabs.settings', Icon: SettingsIcon },
] as const;
