import { useEffect, useMemo, useState } from 'react';

import type { Food } from '@/lib/foods';
import { searchOpenFoodFacts } from '@/lib/openfoodfacts';
import { searchTaco } from '@/lib/taco';

/** Wait after the last keystroke before calling Open Food Facts. */
const REMOTE_DEBOUNCE_MS = 600;
/** Shorter terms match too many products to be useful. */
const REMOTE_MIN_LENGTH = 3;

export type RemoteSearch =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; results: Food[] }
  | { status: 'error'; message: string };

/**
 * Combined food search: TACO (bundled, generic foods) updates on every
 * keystroke, Open Food Facts (online, packaged products) once typing pauses.
 * `retry` searches Open Food Facts again after an error.
 */
export function useFoodSearch(query: string) {
  const term = query.trim();
  const taco = useMemo(() => searchTaco(term), [term]);
  const [attempt, setAttempt] = useState(0);
  // Outcome of the latest finished request; `key` tells which search it answers.
  const [settled, setSettled] = useState<{ key: string; search: RemoteSearch }>();
  const enabled = term.length >= REMOTE_MIN_LENGTH;
  const key = `${attempt}:${term}`;

  useEffect(() => {
    if (!enabled) return;
    // Responses of superseded searches are ignored.
    let current = true;
    const timer = setTimeout(() => {
      searchOpenFoodFacts(term).then(
        (results) => current && setSettled({ key, search: { status: 'done', results } }),
        (error: Error) =>
          current && setSettled({ key, search: { status: 'error', message: error.message } }),
      );
    }, REMOTE_DEBOUNCE_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [enabled, term, key]);

  const remote: RemoteSearch = !enabled
    ? { status: 'idle' }
    : settled?.key === key
      ? settled.search
      : { status: 'loading' };

  return { taco, remote, retry: () => setAttempt((value) => value + 1) };
}
