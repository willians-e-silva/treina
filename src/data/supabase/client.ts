import type { PostgrestError } from '@supabase/supabase-js';

export { supabase } from '@/lib/supabase';

// Generic over the whole response: it is a union (data or error), which
// would make a `T` taken from `data` alone come out as `never`.
type Response = { data: unknown; error: PostgrestError | null };

/** The `data` of a Supabase response; its error, if any, is thrown. */
export function must<R extends Response>(result: R): NonNullable<R['data']> {
  if (result.error) throw result.error;
  if (result.data === null) throw new Error('Supabase returned no data');
  return result.data as NonNullable<R['data']>;
}

/** The row of a `maybeSingle()` query, or `null` when there is none. */
export function maybe<R extends Response>(result: R): R['data'] | null {
  if (result.error) throw result.error;
  return result.data;
}

/** Throws the error of a Supabase response that returns no data. */
export function done(result: { error: PostgrestError | null }) {
  if (result.error) throw result.error;
}

/** Rows per request; PostgREST returns at most 1000 at a time. */
const PAGE_SIZE = 1000;

/**
 * Every row of a query, fetched page by page so a long history is not cut at
 * the server's limit. `page(from, to)` runs the query with `.range(from, to)`.
 */
export async function selectAll<T>(
  page: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: PostgrestError | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

/** `("a","b")` for PostgREST's `in` filter. */
export function inList(values: readonly string[]) {
  return `(${values.map((value) => `"${value.replaceAll('"', '\\"')}"`).join(',')})`;
}
