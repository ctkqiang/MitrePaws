/**
 * 界面文案入口 — 类型安全的字典访问与语言绑定。
 *
 * 组件只通过 useT() 取文案，绝不硬编码用户可见字符串；
 * 占位符插值统一走 formatMessage。
 */

import { useCallback } from 'react';

import { useLocaleStore } from '@/stores/localeStore';
import type { Locale } from '@/types/stix';

import en from './dictionaries/en';
import type { DictionarySchema } from './dictionaries/en';
import zh from './dictionaries/zh';

/** 字典点路径类型：把嵌套字典展开为 'a.b.c' 形式的键联合。 */
type LeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${LeafPaths<T[K]>}`;
}[keyof T & string];

/** 全量可翻译键（由英文源字典推导）。 */
export type TranslationKey = LeafPaths<typeof en>;

/** 双语字典表。 */
const DICTIONARIES: Record<Locale, DictionarySchema> = { en, zh };

/**
 * 判断值是否为可继续下钻的对象。
 *
 * @param {unknown} value - 待判断的值。
 * @returns {boolean} 为普通对象时返回 true。
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * 按语言与点路径键取界面文案；键缺失时回退为键本身，保证可诊断。
 *
 * @param {Locale} locale - 目标语言。
 * @param {TranslationKey} key - 字典点路径键，如 'tabs.matrix'。
 * @returns {string} 本地化文案。
 *
 * @example
 * t('zh', 'tabs.matrix'); // '矩阵'
 */
export const t = (locale: Locale, key: TranslationKey): string => {
  const node = key
    .split('.')
    .reduce<unknown>(
      (current, part) => (isRecord(current) ? current[part] : undefined),
      DICTIONARIES[locale],
    );
  return typeof node === 'string' ? node : key;
};

/**
 * 将模板中的 `{name}` 占位符替换为参数值；未提供的占位符保持原样。
 *
 * @param {string} template - 含占位符的文案模板。
 * @param {Record<string, string | number>} params - 占位符参数表。
 * @returns {string} 插值后的文案。
 *
 * @example
 * formatMessage(t('zh', 'techniques.count'), { count: 24 }); // '共 24 条技术'
 */
export const formatMessage = (
  template: string,
  params: Record<string, string | number>,
): string =>
  template.replace(/\{(\w+)\}/g, (raw, name: string) =>
    name in params ? String(params[name]) : raw,
  );

/**
 * 绑定当前语言的翻译函数；语言切换时下帧即生效。
 *
 * @returns {(key: TranslationKey) => string} 稳定的取文案函数。
 *
 * @example
 * const t = useT();
 * t('settings.title');
 */
export const useT = (): ((key: TranslationKey) => string) => {
  const locale = useLocaleStore((state) => state.locale);
  return useCallback((key: TranslationKey) => t(locale, key), [locale]);
};
