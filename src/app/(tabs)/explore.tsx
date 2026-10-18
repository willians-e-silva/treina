import { ScreenTitle } from '@/components/screen-title';
import { SurfaceTest } from '@/components/surface-test';
import { TabScreen } from '@/components/tab-screen';
import { getMainTab } from '@/constants/tabs';

const tab = getMainTab('explore');

export default function ExploreScreen() {
  return (
    <TabScreen header={<ScreenTitle>{tab.label}</ScreenTitle>}>
      {/* TEMPORARY: swap back to <ComingSoon icon={tab.icon} /> after testing. */}
      <SurfaceTest />
    </TabScreen>
  );
}
