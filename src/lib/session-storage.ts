// Provides the `localStorage` the session is kept in, so the user stays
// signed in between launches (https://docs.expo.dev/guides/using-supabase/).
import 'expo-sqlite/localStorage/install';

/** Where Supabase Auth keeps the session on Android and iOS. */
export const sessionStorage = localStorage;
