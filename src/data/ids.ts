let nextId = 0;

/** Unique id for a new record, created in the app so it can be shown before it is saved. */
export function createId() {
  nextId += 1;
  return `${Date.now()}-${nextId}`;
}
