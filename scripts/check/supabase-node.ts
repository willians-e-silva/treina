/**
 * Stand-in for src/lib/supabase.ts when the repositories run in Node
 * (scripts/check-supabase-repos.ts): the app's client needs React Native.
 * `useClient` swaps the client, like a second device signing in.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../src/data/database.types';

export const isSupabaseConfigured = true;

export function newClient() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Load .env.local first (see the script).');
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

export let supabase: SupabaseClient<Database> = newClient();

export function useClient(client: SupabaseClient<Database>) {
  supabase = client;
}
