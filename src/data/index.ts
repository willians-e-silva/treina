import { localRepositories } from './local';
import { supabaseRepositories } from './supabase';
import type { Repositories } from './types';

import { IS_AUTH_MOCKED } from '@/lib/auth';

export type DataSource = 'local' | 'supabase';

/**
 * `EXPO_PUBLIC_DATA_SOURCE` in `.env.local`; `local` when unset. The demo mode
 * has no Supabase account, so it always keeps its data locally.
 */
export const DATA_SOURCE: DataSource =
  process.env.EXPO_PUBLIC_DATA_SOURCE === 'supabase' && !IS_AUTH_MOCKED ? 'supabase' : 'local';

/** Repositories of the signed-in account, from the configured data source. */
export function repositoriesFor(userId: string): Repositories {
  return DATA_SOURCE === 'supabase' ? supabaseRepositories(userId) : localRepositories(userId);
}
