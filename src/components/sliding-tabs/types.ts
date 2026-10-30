import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';

export type SlidingTabsOptions = {
  /** Label shown in the footer. */
  title?: string;
  /** Icon shown in the footer. */
  tabBarIcon?: LucideIcon;
};

export type SlidingTabsEventMap = {
  tabPress: { data: undefined; canPreventDefault: true };
  tabLongPress: { data: undefined };
};

/**
 * One footer tab, in the order declared in the layout. `key` and `render`
 * are missing until the tab's route exists in the navigation state.
 */
export type SlidingTab = {
  name: string;
  key?: string;
  options: SlidingTabsOptions;
  render?: () => ReactNode;
};
