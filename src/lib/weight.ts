export type WeighIn = {
  /** `YYYY-MM-DD` (local time). */
  date: string;
  kg: number;
};

/** Adds the weigh-in, replacing the one of the same day; keeps oldest first. */
export function upsertWeighIn(entries: readonly WeighIn[], weighIn: WeighIn): WeighIn[] {
  return [...entries.filter((entry) => entry.date !== weighIn.date), weighIn].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}
