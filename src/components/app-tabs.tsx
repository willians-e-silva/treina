import { SlidingTabs } from '@/components/sliding-tabs';
import { MainTabs } from '@/constants/tabs';

/** Main footer tabs; their order and content come from `MainTabs`. */
export default function AppTabs() {
  return (
    <SlidingTabs>
      {MainTabs.map((tab) => (
        <SlidingTabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.label, tabBarIcon: tab.icon }}
        />
      ))}
    </SlidingTabs>
  );
}
