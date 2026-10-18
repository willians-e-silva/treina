import type { ParamListBase, TabNavigationState } from 'expo-router/react-navigation';
import { useState, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { animateTabPosition } from './use-tab-position';

/** Horizontal travel (px) before the swipe takes over from vertical scrolling. */
const ACTIVATION_DISTANCE = 15;
/** Vertical travel (px) after which the swipe gives way to scrolling. */
const FAIL_DISTANCE = 12;
/** How far ahead a release "throws" the pages, in seconds of velocity. */
const VELOCITY_PROJECTION = 0.2;
/** Resistance when dragging past the first or last tab. */
const EDGE_RESISTANCE = 0.3;

type TabPagerProps = {
  state: TabNavigationState<ParamListBase>;
  renderScene: (routeKey: string) => ReactNode;
  position: SharedValue<number>;
  target: SharedValue<number>;
  /** Called on the JS thread when a swipe settles on another tab. */
  onSwipeToIndex: (index: number) => void;
};

/**
 * Lays the tab screens side by side and slides them with `position`, either
 * animated (footer taps) or following the finger (horizontal swipe).
 *
 * A screen mounts once it is focused, adjacent to the focused one (so a swipe
 * never reveals a blank page) or crossed during a jump, and then stays
 * mounted, keeping its state.
 */
export function TabPager({ state, renderScene, position, target, onSwipeToIndex }: TabPagerProps) {
  const window = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const width = measuredWidth ?? window.width;
  const lastIndex = state.routes.length - 1;
  const mounted = useMountedIndexes(state.index, lastIndex);

  const dragging = useSharedValue(false);
  const dragStartPosition = useSharedValue(0);
  const dragFromIndex = useSharedValue(0);

  const swipe = Gesture.Pan()
    .activeOffsetX([-ACTIVATION_DISTANCE, ACTIVATION_DISTANCE])
    .failOffsetY([-FAIL_DISTANCE, FAIL_DISTANCE])
    .onStart(() => {
      // Grabbing mid-animation continues from where the pages are.
      dragging.set(true);
      dragStartPosition.set(position.get());
      dragFromIndex.set(target.get());
    })
    .onUpdate((event) => {
      const raw = dragStartPosition.get() - event.translationX / width;
      let next = raw;
      if (raw < 0) next = raw * EDGE_RESISTANCE;
      else if (raw > lastIndex) next = lastIndex + (raw - lastIndex) * EDGE_RESISTANCE;
      position.set(next);
    })
    .onFinalize((event) => {
      if (!dragging.get()) return;
      dragging.set(false);

      // Settle on the nearest page after projecting the fling, at most one
      // page away from where the drag started.
      const from = dragFromIndex.get();
      const projected = position.get() - (event.velocityX / width) * VELOCITY_PROJECTION;
      const next = Math.min(
        Math.max(Math.round(projected), from - 1, 0),
        from + 1,
        lastIndex,
      );

      animateTabPosition(position, target, next);
      if (next !== from) {
        scheduleOnRN(onSwipeToIndex, next);
      }
    });

  return (
    <GestureDetector gesture={swipe}>
      <View style={styles.pager} onLayout={(e) => setMeasuredWidth(e.nativeEvent.layout.width)}>
        {state.routes.map((route, index) =>
          mounted.has(index) ? (
            <Scene
              key={route.key}
              index={index}
              width={width}
              position={position}
              focused={index === state.index}>
              {renderScene(route.key)}
            </Scene>
          ) : null,
        )}
      </View>
    </GestureDetector>
  );
}

type SceneProps = {
  index: number;
  width: number;
  position: SharedValue<number>;
  focused: boolean;
  children: ReactNode;
};

function Scene({ index, width, position, focused, children }: SceneProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (index - position.get()) * width }],
  }));

  return (
    <Animated.View
      // Off-screen pages stay mounted but are hidden from touch and screen readers.
      aria-hidden={!focused}
      style={[styles.scene, { pointerEvents: focused ? 'auto' : 'none' }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

/**
 * Indexes of every page that has been focused, crossed during a transition,
 * or is adjacent to the focused page (reachable by a swipe).
 */
function useMountedIndexes(index: number, lastIndex: number) {
  const [mounted, setMounted] = useState(() => withNeighbors(new Set<number>(), index, index, lastIndex));
  const [previousIndex, setPreviousIndex] = useState(index);

  // Adjust state while rendering (instead of in an effect) so the crossed
  // pages are already mounted in the same frame the transition starts.
  if (previousIndex !== index) {
    setPreviousIndex(index);
    setMounted(withNeighbors(mounted, previousIndex, index, lastIndex));
  }

  return mounted;
}

function withNeighbors(mounted: Set<number>, from: number, to: number, lastIndex: number) {
  const next = new Set(mounted);
  const start = Math.max(Math.min(from, to) - 1, 0);
  const end = Math.min(Math.max(from, to) + 1, lastIndex);
  for (let i = start; i <= end; i++) {
    next.add(i);
  }
  return next;
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
    overflow: 'hidden',
  },
  scene: {
    ...StyleSheet.absoluteFill,
  },
});
