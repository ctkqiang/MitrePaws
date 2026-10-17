/**
 * 矩阵页 — 豆包式首页：克制排版 Hero + 按战术分节的横滑货架。
 *
 * 动效预算：全页只允许 Hero 一次轻量淡入（外层 {@link AnimatedEntrance}，
 * 减弱动态时自动降级为直出）；货架与卡片为纯静态渲染，
 * 避免数据集全量挂载时并发拉起大量动画 worklet（性能红线）。
 */

import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedEntrance } from '@/components/AnimatedEntrance';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { MatrixHero } from '@/components/matrix/MatrixHero';
import { TacticShelf } from '@/components/matrix/TacticShelf';
import { ScreenScaffold } from '@/components/ScreenScaffold';
import { useT } from '@/i18n';
import { Spacing } from '@/theme/tokens';
import { useMatrixViewModel } from '@/viewmodels/useMatrixViewModel';

/** 矩阵首页路由组件。 */
export default function MatrixScreen() {
  const t = useT();
  const resource = useMatrixViewModel();

  /** 就绪时从矩阵列聚合战术 / 主技术总数，供 Hero 统计卡展示。 */
  const totals = useMemo(() => {
    if (resource.status !== 'ready') {
      return { tacticCount: 0, techniqueCount: 0 };
    }
    return {
      tacticCount: resource.data.length,
      techniqueCount: resource.data.reduce((sum, col) => sum + col.techniques.length, 0),
    };
  }, [resource]);

  return (
    <ScreenScaffold scroll>
      {/* Hero — 全页唯一入场动画 */}
      <AnimatedEntrance offset={12} scaleFrom={1}>
        <MatrixHero tacticCount={totals.tacticCount} techniqueCount={totals.techniqueCount} />
      </AnimatedEntrance>

      {/* 加载状态 */}
      {resource.status === 'loading' && <LoadingSkeleton />}

      {/* 错误状态 */}
      {resource.status === 'error' && (
        <EmptyState title={t('common.error')} message={resource.message} />
      )}

      {/* 战术货架列表 — 静态渲染，不挂动画 */}
      {resource.status === 'ready' &&
        resource.data.map((col) => <TacticShelf key={col.externalId} column={col} />)}

      {/* 底部留白，避免内容被底栏遮挡 */}
      <View style={styles.bottomSpacer} />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  bottomSpacer: {
    height: Spacing.four,
  },
});
