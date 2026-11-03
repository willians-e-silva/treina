// Provides the `localStorage` the session is kept in, so the user stays
// signed in between launches (https://docs.expo.dev/guides/using-supabase/).
import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import type { Database } from '@/data/database.types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Publishable key only: Row Level Security protects the data. The service
// role key bypasses it and must never be in the app.
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** `false` when `.env.local` lacks the project's URL or key. */
export const isSupabaseConfigured = !!url && !!publishableKey;

if (!isSupabaseConfigured) {
  console.warn(
    'EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing in .env.local.',
  );
}

export const supabase = createClient<Database>(
  url || 'https://not-configured.supabase.co',
  publishableKey || 'not-configured',
  {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Android and iOS have no URL to read a session from.
      detectSessionInUrl: false,
    },
  },
);

// Refreshes the token only while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
