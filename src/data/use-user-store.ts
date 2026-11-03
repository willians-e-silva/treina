import { useEffect, useRef, useState } from 'react';

import { repositoriesFor } from '.';
import type { Repositories } from './types';

/** `idle`: signed out, nothing to load. */
export type StoreStatus = 'idle' | 'loading' | 'ready' | 'error';

type State<T> = {
  /** Account the data belongs to. */
  userId: string | null;
  status: StoreStatus;
  data: T;
  /** Bumped to load again. */
  attempt: number;
  /** A change on screen could not be saved; `retrySave` sends it again. */
  saveFailed: boolean;
};

type Save = () => Promise<unknown>;

function initialState<T>(userId: string | null, empty: T): State<T> {
  return {
    userId,
    status: userId ? 'loading' : 'idle',
    data: empty,
    attempt: 0,
    saveFailed: false,
  };
}

/**
 * Data of one domain for the signed-in account: loads it from the
 * repositories and starts over, from `empty`, whenever the account changes,
 * so nothing of one account is ever shown to another.
 *
 * Changes are shown right away (`update`) and saved in the background
 * (`write`), one at a time and in order, since later saves can depend on
 * earlier ones (an exercise needs its workout). When a save fails the queue
 * stops, `saveFailed` turns on, and `retrySave` sends the waiting saves again
 * in the same order; what is on screen is kept.
 *
 * `load` must be a module-level function (it is an effect dependency).
 */
export function useUserStore<T>(
  userId: string | null,
  empty: T,
  load: (repositories: Repositories) => Promise<T>,
) {
  const [state, setState] = useState(() => initialState(userId, empty));
  // Latest data, for changes made one after another before a re-render (e.g.
  // joining a package imports workouts and then sets every weekday).
  const latest = useRef<{ userId: string | null; data: T }>({ userId, data: empty });
  // Saves not done yet, oldest first, for the account they belong to.
  const queue = useRef<{ userId: string | null; saves: Save[]; running: boolean; failed: boolean }>(
    { userId, saves: [], running: false, failed: false },
  );

  // Another account, or none: drop the data during render, before it shows.
  if (state.userId !== userId) {
    setState(initialState(userId, empty));
  }

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    load(repositoriesFor(userId)).then(
      (data) => {
        if (cancelled) return;
        latest.current = { userId, data };
        setState((current) => ({ ...current, status: 'ready', data }));
      },
      (error: unknown) => {
        if (cancelled) return;
        console.warn('Failed to load user data', error);
        setState((current) => ({ ...current, status: 'error' }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [userId, state.attempt, load]);

  function retry() {
    setState((current) => ({ ...current, status: 'loading', attempt: current.attempt + 1 }));
  }

  /** Changes what is on screen right away; returns the new data. */
  function update(change: (data: T) => T): T {
    const base = latest.current.userId === userId ? latest.current.data : empty;
    const next = change(base);
    latest.current = { userId, data: next };
    setState((current) => ({ ...current, data: next }));
    return next;
  }

  async function flush() {
    const current = queue.current;
    if (current.running || current.failed) return;
    current.running = true;
    while (current.saves.length > 0 && queue.current === current) {
      try {
        await current.saves[0]();
        current.saves.shift();
      } catch (error) {
        console.warn('Failed to save user data', error);
        current.failed = true;
        if (queue.current === current) {
          setState((previous) => ({ ...previous, saveFailed: true }));
        }
        break;
      }
    }
    current.running = false;
  }

  /** Saves a change already shown with `update`. */
  function write(save: (repositories: Repositories) => Promise<unknown>) {
    if (!userId) return;
    if (queue.current.userId !== userId) {
      // Saves of the previous account are dropped with its data.
      queue.current = { userId, saves: [], running: false, failed: false };
    }
    const repositories = repositoriesFor(userId);
    queue.current.saves.push(() => save(repositories));
    void flush();
  }

  /** Sends the saves that failed, and the ones waiting after them, again. */
  function retrySave() {
    queue.current.failed = false;
    setState((current) => ({ ...current, saveFailed: false }));
    void flush();
  }

  const own = state.userId === userId;
  return {
    status: own ? state.status : initialState(userId, empty).status,
    data: own ? state.data : empty,
    saveFailed: own && state.saveFailed,
    update,
    write,
    /** Loads the data again, e.g. after an error. */
    retry,
    retrySave,
  };
}
