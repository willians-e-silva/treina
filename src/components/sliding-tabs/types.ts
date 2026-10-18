import type {
  Descriptor,
  NavigationProp,
  ParamListBase,
  RouteProp,
  TabNavigationState,
} from 'expo-router/react-navigation';
import type { LucideIcon } from 'lucide-react-native';

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

export type SlidingTabsDescriptors = Record<
  string,
  Descriptor<
    SlidingTabsOptions,
    NavigationProp<
      ParamListBase,
      string,
      string | undefined,
      TabNavigationState<ParamListBase>,
      SlidingTabsOptions,
      SlidingTabsEventMap
    >,
    RouteProp<ParamListBase>
  >
>;
