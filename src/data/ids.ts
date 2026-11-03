import { randomUUID } from 'expo-crypto';

/**
 * Unique id (UUID v4) for a new record, created in the app so it can be shown
 * before it is saved; the database's `uuid` primary keys take it as is.
 */
export function createId() {
  return randomUUID();
}
