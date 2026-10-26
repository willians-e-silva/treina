import { getCachedExercise } from './exercisedb';

export type ExerciseCategory = 'cardio' | 'strength';

export type Exercise = {
  id: string;
  name: string;
  category: ExerciseCategory;
  /** Metabolic equivalent of task, used to estimate calories. */
  met?: number;
  /** Main muscle worked. */
  target?: string;
  equipment?: string;
  /** Animated demonstration. */
  gifUrl?: string;
};

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  cardio: 'Cardiovascular',
  strength: 'Musculação',
};

/** `id` used for exercises typed by the user that are not in the database. */
export const CUSTOM_EXERCISE_ID = 'custom';

/** Exercise already loaded from ExerciseDB in this session. */
export function getExercise(id: string) {
  return getCachedExercise(id);
}

/** kcal burned = MET × 3,5 × kg ÷ 200 per minute. */
export function estimateCalories(met: number, weightKg: number, minutes: number) {
  return Math.round(((met * 3.5 * weightKg) / 200) * minutes);
}

type EntryBase = {
  id: string;
  /** Diary day as `YYYY-MM-DD` (local time). */
  date: string;
  name: string;
};

export type CardioEntry = EntryBase & {
  category: 'cardio';
  minutes: number;
  calories: number;
};

export type StrengthEntry = EntryBase & {
  category: 'strength';
  sets: number;
  reps: number;
  /** Weight per set in kg; 0 for bodyweight exercises. */
  weightKg: number;
};

export type ExerciseEntry = CardioEntry | StrengthEntry;
export type NewExerciseEntry = Omit<CardioEntry, 'id'> | Omit<StrengthEntry, 'id'>;

/** `Date` → `"2026-10-19"` in local time. */
export function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(key: string, days: number) {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}
