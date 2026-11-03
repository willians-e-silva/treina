/**
 * Where Supabase Auth keeps the session on the web: the browser's own
 * `localStorage`, so expo-sqlite (and its WebAssembly worker) stays out of the
 * web bundle. `undefined` outside a browser (e.g. a server render), where the
 * session lives in memory.
 */
export const sessionStorage = typeof window === 'undefined' ? undefined : window.localStorage;
