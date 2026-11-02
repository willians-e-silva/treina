import { localRepositories } from './local';
import type { Repositories } from './types';

export type DataSource = 'local' | 'supabase';

/** `EXPO_PUBLIC_DATA_SOURCE` in `.env.local`; `local` when unset. */
export const DATA_SOURCE: DataSource =
  process.env.EXPO_PUBLIC_DATA_SOURCE === 'supabase' ? 'supabase' : 'local';

if (DATA_SOURCE === 'supabase') {
  // TODO(phase 4): Supabase repositories.
  console.warn('EXPO_PUBLIC_DATA_SOURCE=supabase is not implemented yet; using local data.');
}

/** Repositories of the signed-in account, from the configured data source. */
export function repositoriesFor(userId: string): Repositories {
  return localRepositories(userId);
}
