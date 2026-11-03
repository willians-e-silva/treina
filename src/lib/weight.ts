import { addDays } from './exercises';

export type WeighIn = {
  /** `YYYY-MM-DD` (local time). */
  date: string;
  kg: number;
};

/** Days of weigh-ins the weight chart can show; at most a year. */
export const WEIGHT_RANGES = [30, 60, 90, 180, 365] as const;
export type WeightRange = (typeof WEIGHT_RANGES)[number];
export const DEFAULT_WEIGHT_RANGE: WeightRange = 90;

/** The weigh-ins of the last `days` days up to `today` (`YYYY-MM-DD`), today included. */
export function weighInsInRange(entries: readonly WeighIn[], days: number, today: string) {
  const after = addDays(today, -days);
  return entries.filter((entry) => entry.date > after && entry.date <= today);
}

/** Adds the weigh-in, replacing the one of the same day; keeps oldest first. */
export function upsertWeighIn(entries: readonly WeighIn[], weighIn: WeighIn): WeighIn[] {
  return [...entries.filter((entry) => entry.date !== weighIn.date), weighIn].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

/** Consecutive weigh-ins of one calendar month: `entries[start..end]`, inclusive. */
export type WeighInPeriod = {
  /** `YYYY-MM`. */
  month: string;
  start: number;
  end: number;
};

/** `entries` (oldest first) split by calendar month. */
export function weighInPeriods(entries: readonly WeighIn[]): WeighInPeriod[] {
  const periods: WeighInPeriod[] = [];
  entries.forEach((entry, index) => {
    const month = entry.date.slice(0, 7);
    const current = periods[periods.length - 1];
    if (current?.month === month) current.end = index;
    else periods.push({ month, start: index, end: index });
  });
  return periods;
}
