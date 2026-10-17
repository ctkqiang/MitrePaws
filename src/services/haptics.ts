/**
 * 触感反馈服务 — expo-haptics 的唯一调用入口。
 *
 * 规范 §11.5：仅用于确认操作、书签切换、标签页切换，
 * 统一使用轻量级别，绝不在普通列表项上触发。
 * Web 端没有触觉硬件，所有方法静默降级为空操作。
 */

import { Platform } from 'react-native';

import * as ExpoHaptics from 'expo-haptics';

/** 仅 Apple / Android 真机存在触觉引擎；Web 直接短路。 */
const HAPTICS_AVAILABLE = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * 选择型轻触：标签页切换等「游标移动」语义。
 *
 * @returns 异步触发，调用方无需 await。
 */
const selection = (): void => {
  if (HAPTICS_AVAILABLE) {
    void ExpoHaptics.selectionAsync();
  }
};

/**
 * 轻量冲击：书签切换、清空等确认操作语义。
 *
 * @returns 异步触发，调用方无需 await。
 */
const lightImpact = (): void => {
  if (HAPTICS_AVAILABLE) {
    void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
  }
};

/** 触感反馈门面；业务层只允许依赖此对象。 */
export const haptics = {
  selection,
  lightImpact,
} as const;
