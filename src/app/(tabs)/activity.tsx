import { ComingSoon } from '@/components/coming-soon';
import { ScreenTitle } from '@/components/screen-title';
import { TabScreen } from '@/components/tab-screen';
import { getMainTab } from '@/constants/tabs';

const tab = getMainTab('activity');

export default function ActivityScreen() {
  return (
    <TabScreen header={<ScreenTitle>{tab.label}</ScreenTitle>}>
      <ComingSoon icon={tab.icon} />
    </TabScreen>
  );
}
