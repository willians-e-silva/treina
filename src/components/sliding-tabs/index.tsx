import { withLayoutContext } from 'expo-router';
import {
  createNavigatorFactory,
  TabActions,
  TabRouter,
  useNavigationBuilder,
  type DefaultNavigatorOptions,
  type ParamListBase,
  type TabActionHelpers,
  type TabNavigationState,
  type TabRouterOptions,
} from 'expo-router/react-navigation';
import { StyleSheet, View } from 'react-native';

import { TabBar } from './tab-bar';
import { TabPager } from './tab-pager';
import type { SlidingTabsEventMap, SlidingTabsOptions } from './types';
import { useTabPosition } from './use-tab-position';

type SlidingTabsNavigatorProps = DefaultNavigatorOptions<
  ParamListBase,
  string | undefined,
  TabNavigationState<ParamListBase>,
  SlidingTabsOptions,
  SlidingTabsEventMap,
  unknown
> &
  TabRouterOptions;

/**
 * Tab navigator whose screens sit side by side and slide horizontally (footer
 * taps or swipes), with a footer whose selected color travels with the content. Built on React
 * Navigation's `TabRouter` (the same router as the default tabs), so the
 * navigation state stays the single source of truth for the focused tab.
 */
function SlidingTabsNavigator(props: SlidingTabsNavigatorProps) {
  const { state, descriptors, navigation, NavigationContent } = useNavigationBuilder<
    TabNavigationState<ParamListBase>,
    TabRouterOptions,
    TabActionHelpers<ParamListBase>,
    SlidingTabsOptions,
    SlidingTabsEventMap
  >(TabRouter, props);
  const { position, target } = useTabPosition(state.index);

  function jumpToIndex(index: number) {
    navigation.dispatch({
      ...TabActions.jumpTo(state.routes[index].name, state.routes[index].params),
      target: state.key,
    });
  }

  return (
    <NavigationContent>
      <View style={styles.container}>
        <TabPager
          state={state}
          position={position}
          target={target}
          onSwipeToIndex={jumpToIndex}
          renderScene={(routeKey) => descriptors[routeKey].render()}
        />
        <TabBar
          state={state}
          descriptors={descriptors}
          navigation={navigation}
          position={position}
        />
      </View>
    </NavigationContent>
  );
}

const Navigator = createNavigatorFactory(SlidingTabsNavigator)().Navigator;

/** Expo Router layout component: `<SlidingTabs><SlidingTabs.Screen … /></SlidingTabs>`. */
export const SlidingTabs = withLayoutContext<
  SlidingTabsOptions,
  typeof SlidingTabsNavigator,
  TabNavigationState<ParamListBase>,
  SlidingTabsEventMap
>(Navigator, undefined, true);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
