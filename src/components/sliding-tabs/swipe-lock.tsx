import { createContext, use } from 'react';

/**
 * Lets a screen turn off the swipe between tabs while it handles its own
 * horizontal drag (e.g. reordering the dashboard).
 */
export const SwipeLockContext = createContext<(locked: boolean) => void>(() => {});

export function useTabSwipeLock() {
  return use(SwipeLockContext);
}
