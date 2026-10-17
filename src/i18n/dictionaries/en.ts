/**
 * 英文界面字典 — 唯一源字典。
 *
 * 其他语言字典通过 DictionarySchema 与本字典保持键位对齐；
 * 文案中 `{name}` 形式的占位符由 formatMessage 在运行时注入。
 */

/** 将 as const 字典的叶子字面量类型拓宽为 string，供译文字典对齐形状。 */
export type WidenLeaves<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : WidenLeaves<T[K]>;
};

/** 英文源字典（as const 保留字面量类型，供 TranslationKey 推导）。 */
const en = {
  home: {
    viewAll: 'View all',
  },
  detail: {
    sections: {
      overview: 'Overview',
      detection: 'Detection',
      detectionStrategies: 'Detection Strategies',
      platforms: 'Platforms',
      tactics: 'Tactics',
      parent: 'Parent Technique',
      subtechniques: 'Sub-techniques',
      usedBy: 'Used By',
      procedureExamples: 'Procedure Examples',
      mitigations: 'Mitigations',
      dataSources: 'Data Sources',
      capec: 'CAPEC',
      metadata: 'Metadata',
      impactType: 'Impact Type',
      remoteSupport: 'Remote Support',
      contributors: 'Contributors',
      references: 'References',
    },
    badge: {
      deprecated: 'Deprecated',
      revoked: 'Revoked',
    },
    metadata: {
      version: 'Version',
      created: 'Created',
      modified: 'Last Modified',
      remoteSupportYes: 'Yes',
      remoteSupportNo: 'No',
    },
    strategy: {
      analytics: 'Analytics',
      logSources: 'Log Sources',
    },
  },
  list: {
    resultCount: '{count} results',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    languageHint: 'Switch the interface and content language',
    theme: 'Theme',
    themeHint: 'Choose your preferred appearance',
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    about: 'About',
    dataset: 'Dataset',
    attribution: 'Attribution',
    attributionBody:
      'MITRE ATT&CK® is a registered trademark of The MITRE Corporation. ' +
      'ATT&CK content is copyright The MITRE Corporation and licensed under Apache-2.0. ' +
      'Simplified Chinese content is translated and redistributed; ' +
      'The MITRE Corporation does not warrant the translation.',
    author: 'Developer',
    email: 'Email',
    website: 'Website',
    fontSize: 'Font Size',
    fontSizeHint: 'Adjust the text size throughout the app (10-30)',
    fontSizeReset: 'Reset',
    fontPreviewTitle: 'Aa Font Preview',
    fontPreviewBody: 'The quick brown fox jumps over the lazy dog',
  },
  tabs: {
    matrix: 'Matrix',
    techniques: 'Techniques',
    search: 'Search',
    bookmarks: 'Bookmarks',
    settings: 'Settings',
  },
  common: {
    loading: 'Loading…',
    error: 'Something went wrong',
    retry: 'Retry',
    empty: {
      title: 'Nothing here yet',
      message: 'Content you bookmark will appear here.',
    },
    noResults: {
      title: 'No results',
      message: 'Try a different keyword or clear the filters.',
    },
    bookmarked: 'Bookmarked',
    removeBookmark: 'Remove bookmark',
    addBookmark: 'Add bookmark',
    clear: 'Clear',
  },
  matrix: {
    title: 'ATT&CK Matrix',
    subtitle: 'Enterprise tactics and techniques at a glance',
    heroTag: 'Complete dataset · works offline',
    statsTactics: 'Tactics',
    statsTechniques: 'Techniques',
    subCount: '+{count} sub-techniques',
  },
  techniques: {
    title: 'Techniques',
    subtitle: 'Browse all techniques and sub-techniques',
    count: '{count} techniques',
  },
  search: {
    placeholder: 'Search tactics, techniques, groups…',
    filterAll: 'All tactics',
  },
} as const;

/** 译文字典需要满足的形状（叶子拓宽为 string）。 */
export type DictionarySchema = WidenLeaves<typeof en>;

export default en;
