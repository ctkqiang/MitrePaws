/**
 * 简体中文界面字典 — 与英文源字典键位一一对齐。
 *
 * 通过 `satisfies DictionarySchema`（即 typeof en 的叶子拓宽形状）在编译期
 * 强制键位一致；as const 的英文字面量无法直接容纳译文，
 * 因此对齐目标是拓宽后的形状而非字面量本身。
 */

import type { DictionarySchema } from './en';

/** 简体中文译文字典。 */
const zh = {
  home: {
    viewAll: '查看全部',
  },
  detail: {
    sections: {
      overview: '概述',
      detection: '检测',
      detectionStrategies: '检测策略',
      platforms: '适用平台',
      tactics: '所属战术',
      parent: '父技术',
      subtechniques: '子技术',
      usedBy: '使用方',
      procedureExamples: '攻击过程示例',
      mitigations: '缓解措施',
      dataSources: '数据源',
      capec: 'CAPEC',
      metadata: '元信息',
      impactType: '影响类型',
      remoteSupport: '远程支持',
      contributors: '贡献者',
      references: '外部引用',
    },
    badge: {
      deprecated: '已废弃',
      revoked: '已撤销',
    },
    metadata: {
      version: '版本',
      created: '创建时间',
      modified: '最后修改',
      remoteSupportYes: '支持',
      remoteSupportNo: '不支持',
    },
    strategy: {
      analytics: '分析项',
      logSources: '日志源',
    },
  },
  list: {
    resultCount: '{count} 条结果',
  },
  settings: {
    title: '设置',
    language: '语言',
    languageHint: '切换界面与内容语言',
    theme: '外观',
    themeHint: '选择你喜欢的主题模式',
    themeAuto: '跟随系统',
    themeLight: '浅色',
    themeDark: '深色',
    about: '关于',
    dataset: '数据集',
    attribution: '署名声明',
    attributionBody:
      'MITRE ATT&CK® 是 The MITRE Corporation 的注册商标。' +
      'ATT&CK 内容版权归 The MITRE Corporation 所有，采用 Apache-2.0 许可。' +
      '简体中文内容为翻译后再分发版本；The MITRE Corporation 不对译文质量作出担保。',
    author: '开发者',
    email: '邮箱',
    website: '网站',
    fontSize: '字体大小',
    fontSizeHint: '调整全应用的文字大小（10-30）',
    fontSizeReset: '重置',
    fontPreviewTitle: 'Aa 字体预览',
    fontPreviewBody: '敏捷的棕色狐狸跳过懒惰的狗',
  },
  tabs: {
    matrix: '矩阵',
    techniques: '技术',
    search: '搜索',
    bookmarks: '书签',
    settings: '设置',
  },
  common: {
    loading: '加载中…',
    error: '出错了',
    retry: '重试',
    empty: {
      title: '这里还空空的',
      message: '你收藏的内容会出现在这里。',
    },
    noResults: {
      title: '没有找到结果',
      message: '换个关键词试试，或清除筛选条件。',
    },
    bookmarked: '已收藏',
    removeBookmark: '移除书签',
    addBookmark: '加入书签',
    clear: '清空',
  },
  matrix: {
    title: 'ATT&CK 矩阵',
    subtitle: '企业领域战术与技术总览',
    heroTag: '完整数据集 · 离线可用',
    statsTactics: '战术',
    statsTechniques: '技术',
    subCount: '+{count} 个子技术',
  },
  techniques: {
    title: '技术',
    subtitle: '浏览全部技术与子技术',
    count: '共 {count} 条技术',
  },
  search: {
    placeholder: '搜索战术、技术、组织…',
    filterAll: '全部战术',
  },
} satisfies DictionarySchema;

export default zh;
