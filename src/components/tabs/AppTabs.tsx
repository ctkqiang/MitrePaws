/**
 * 应用底部导航 — expo-router/ui 无头 Tabs 的唯一组装处。
 *
 * 原生端：TabSlot 占据剩余空间，TabBar 以文档流形式停靠底部。
 * Web 端：矩阵等页面的内在内容高度巨大，Tabs 根节点需要相对定位 +
 * overflow 裁剪，TabBar 才能以 absolute 稳定停靠视口底部。
 * iOS Liquid Glass / 其他平台半透明模糊由 TabBar 内部处理。
 */

import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { Platform, type ViewStyle } from 'react-native';

import { useT } from '@/i18n';
import { TabBar } from './TabBar';
import { TabBarButton } from './TabBarButton';
import { TAB_ITEMS } from './tabItems';

/** 原生端：仅占满剩余空间，底栏走文档流。 */
const NATIVE_TABS_FRAME: ViewStyle = { flex: 1 };

/**
 * Web 端：相对定位作为底栏的包含块；高度锁定 + overflow 裁剪，
 * 防止横向滚动列的巨大内在高度把底栏顶出视口。
 * 注意：Tabs 根样式会被这里的 style 整体替换，必须显式带上 flex。
 */
const WEB_TABS_FRAME: ViewStyle = {
  flex: 1,
  position: 'relative',
  height: '100%',
  minHeight: 0,
  overflow: 'hidden',
};

/**
 * 应用底部导航组件。
 *
 * @returns 底部导航根节点。
 */
export default function AppTabs() {
  const t = useT();

  return (
    <Tabs style={Platform.OS === 'web' ? WEB_TABS_FRAME : NATIVE_TABS_FRAME}>
      <TabSlot />
      <TabList asChild>
        <TabBar>
          {TAB_ITEMS.map((item) => (
            <TabTrigger key={item.name} name={item.name} href={item.href} asChild>
              <TabBarButton item={item} label={t(item.labelKey)} />
            </TabTrigger>
          ))}
        </TabBar>
      </TabList>
    </Tabs>
  );
}
