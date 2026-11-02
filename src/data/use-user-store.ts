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
};

function initialState<T>(userId: string | null, empty: T): State<T> {
  return { userId, status: userId ? 'loading' : 'idle', data: empty, attempt: 0 };
}

/**
 * Data of one domain for the signed-in account: loads it from the
 * repositories and starts over, from `empty`, whenever the account changes,
 * so nothing of one account is ever shown to another.
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

  function reload() {
    setState((current) => ({
      ...current,
      status: current.status === 'ready' ? 'ready' : 'loading',
      attempt: current.attempt + 1,
    }));
  }

  /** Changes what is on screen right away; returns the new data. */
  function update(change: (data: T) => T): T {
    const base = latest.current.userId === userId ? latest.current.data : empty;
    const next = change(base);
    latest.current = { userId, data: next };
    setState((current) => ({ ...current, data: next }));
    return next;
  }

  /**
   * Saves a change already shown with `update`. If saving fails, the data is
   * loaded again so the screen shows what was actually saved.
   */
  function write(save: (repositories: Repositories) => Promise<unknown>) {
    if (!userId) return;
    save(repositoriesFor(userId)).catch((error: unknown) => {
      console.warn('Failed to save user data', error);
      reload();
    });
  }

  return {
    status: state.userId === userId ? state.status : initialState(userId, empty).status,
    data: state.userId === userId ? state.data : empty,
    update,
    write,
    /** Loads the data again, e.g. after an error. */
    retry: reload,
  };
}
