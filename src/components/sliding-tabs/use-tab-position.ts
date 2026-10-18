import { useEffect } from 'react';
import {
  Easing,
  ReduceMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

/** Duration of a move to the adjacent tab. */
const BASE_DURATION = 280;
/** Extra time per additional tab crossed, so long jumps don't feel rushed. */
const EXTRA_DURATION_PER_TAB = 90;
const MAX_DURATION = 560;
const EASING = Easing.bezier(0.2, 0, 0, 1);

/**
 * Animates `position` to `target`, retargeting from wherever it currently is.
 * Runs on either thread (used by the effect below and by the swipe gesture).
 */
export function animateTabPosition(
  position: SharedValue<number>,
  target: SharedValue<number>,
  index: number,
) {
  'worklet';
  const distance = Math.abs(index - position.get());
  const duration = Math.min(
    BASE_DURATION + EXTRA_DURATION_PER_TAB * Math.max(0, distance - 1),
    MAX_DURATION,
  );
  target.set(index);
  position.set(withTiming(index, { duration, easing: EASING, reduceMotion: ReduceMotion.System }));
}

/**
 * Continuous tab position (e.g. 1.5 = halfway between the 2nd and 3rd tab)
 * that animates towards the focused index. Both the pager and the footer
 * derive their styles from this single value, so they cannot drift apart.
 *
 * Retargeting mid-animation (rapid taps) starts from the current position,
 * so there is never more than one animation running. With the OS "reduce
 * motion" setting on, the position jumps straight to the target.
 */
export function useTabPosition(index: number) {
  const position = useSharedValue(index);
  /** Index the position is animating to (set first by a swipe release). */
  const target = useSharedValue(index);

  useEffect(() => {
    // A swipe release starts its animation before updating the navigation
    // state; restarting it here would change its speed mid-flight.
    if (target.get() !== index) {
      animateTabPosition(position, target, index);
    }
  }, [index, position, target]);

  return { position, target };
}
