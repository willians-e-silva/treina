import { unstable_useReconcileTabHistory, withLayoutContext } from 'expo-router';
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
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SwipeLockContext } from './swipe-lock';
import { TabBar } from './tab-bar';
import { TabPager } from './tab-pager';
import type { SlidingTab, SlidingTabsEventMap, SlidingTabsOptions } from './types';
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
 *
 * Since SDK 58 the `TabRouter` only creates a tab's route when it is first
 * visited, and `state.routes` is in visit order. The pager needs every page
 * in declared order, so tabs are laid out by `state.routeNames` and every
 * missing route is preloaded on mount.
 */
function SlidingTabsNavigator(props: SlidingTabsNavigatorProps) {
  const { state, descriptors, describe, navigation, NavigationContent } = useNavigationBuilder<
    TabNavigationState<ParamListBase>,
    TabRouterOptions,
    TabActionHelpers<ParamListBase>,
    SlidingTabsOptions,
    SlidingTabsEventMap
  >(TabRouter, props);
  unstable_useReconcileTabHistory({ state, navigation });

  const tabs: SlidingTab[] = state.routeNames.map((name) => {
    const route = state.routes.find((candidate) => candidate.name === name);
    if (!route) {
      // Not created yet: `describe` still resolves the options for the footer.
      return { name, options: describe({ key: undefined, name }).options };
    }
    const descriptor = descriptors[route.key];
    return { name, key: route.key, options: descriptor.options, render: descriptor.render };
  });
  const index = state.routeNames.indexOf(state.routes[state.index].name);
  const { position, target } = useTabPosition(index);
  const [swipeLocked, setSwipeLocked] = useState(false);

  // Joined into a string so the effect only reruns when the set changes.
  const missing = tabs
    .filter((tab) => !tab.key)
    .map((tab) => tab.name)
    .join('\n');
  useEffect(() => {
    if (!missing) return;
    for (const name of missing.split('\n')) {
      navigation.dispatch({ type: 'PRELOAD', payload: { name }, target: state.key });
    }
  }, [missing, navigation, state.key]);

  function jumpToIndex(next: number) {
    const name = state.routeNames[next];
    const route = state.routes.find((candidate) => candidate.name === name);
    navigation.dispatch({ ...TabActions.jumpTo(name, route?.params), target: state.key });
  }

  return (
    <NavigationContent>
      <SwipeLockContext value={setSwipeLocked}>
        <View style={styles.container}>
          <TabPager
            tabs={tabs}
            index={index}
            position={position}
            target={target}
            swipeEnabled={!swipeLocked}
            onSwipeToIndex={jumpToIndex}
          />
          <TabBar
            tabs={tabs}
            index={index}
            navigation={navigation}
            position={position}
            onPressIndex={jumpToIndex}
          />
        </View>
      </SwipeLockContext>
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
>(Navigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
