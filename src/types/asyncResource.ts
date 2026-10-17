/**
 * 异步资源状态契约 — 所有 ViewModel 的加载分支统一形状。
 *
 * 渲染侧只需对 status 做可辨识联合收窄：
 * 'loading' → 骨架屏；'ready' → data；'error' → 重试界面。
 * 预期失败一律编码进状态，绝不像 UI 抛异常。
 */

/** 异步资源的统一状态形状。 */
export type AsyncResource<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string };

/** 可触发重试的动作签名。 */
export type RetryFn = () => void;
