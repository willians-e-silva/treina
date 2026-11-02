import { fromDateKey } from './exercises';

/** An exercise inside a workout, with what is planned for it. */
export type PlannedExercise = {
  /** Unique within the plan; links diary entries back to it. */
  id: string;
  name: string;
  /** MET of the exercise, when known, to estimate the calories of cardio. */
  met?: number;
  /** Trainer's note on how to do it, e.g. "Desça devagar, em 3 segundos". */
  note?: string;
} & (
  | { category: 'cardio'; minutes: number }
  | { category: 'strength'; sets: number; reps: number; weightKg: number }
);

/** `Omit` applied to each member of a union, keeping it discriminated. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type NewPlannedExercise = DistributiveOmit<PlannedExercise, 'id'>;

/** A named group of exercises done in one session, e.g. "Treino A – Peito". */
export type Workout = {
  id: string;
  name: string;
  exercises: PlannedExercise[];
  /** One or two lines for the workout's card (trainers' workouts). */
  summary?: string;
  /** Longer text for the workout's own screen (trainers' workouts). */
  description?: string;
  /**
   * Trainer's package the workout was copied from. Such workouts cannot be
   * changed: they leave the plan when the user leaves the package.
   */
  source?: WorkoutSource;
};

export type WorkoutSource = { trainerId: string; packageId: string };

/**
 * How workouts are scheduled:
 * - `weekly`: each day of the week has its own workout (or none, a rest day);
 * - `queue`: workouts follow one another in order, whatever the day, and the
 *   queue starts over when it reaches the end.
 */
export type PlanMode = 'weekly' | 'queue';

export const PLAN_MODE_LABELS: Record<PlanMode, string> = {
  weekly: 'Semanal',
  queue: 'Fila',
};

/** `Date#getDay()` numbers, Monday first as on a Brazilian calendar. */
export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
};

export type WorkoutPlan = {
  mode: PlanMode;
  /** Workout of each day of the week; missing = rest day. */
  weekly: Partial<Record<Weekday, string>>;
  /** Workout ids in queue order; the same workout may appear more than once. */
  queue: string[];
  /** Index in `queue` of the next workout. */
  queueIndex: number;
};

/** How the user felt after a workout, from 0 (very bad) to 5 (great). */
export type Feeling = 0 | 1 | 2 | 3 | 4 | 5;

export const FEELING_LABELS: Record<Feeling, string> = {
  0: 'Péssimo',
  1: 'Muito mal',
  2: 'Mal',
  3: 'Normal',
  4: 'Bem',
  5: 'Ótimo',
};

/** Details recorded when a workout is finished from a timed session. */
export type SessionSummary = {
  durationSeconds: number;
  feeling: Feeling;
};

/** A workout marked as done on a diary day. */
export type WorkoutCompletion = {
  date: string;
  workoutId: string;
  /** Present when it was finished from a timed session. */
  session?: SessionSummary;
};

/** `65` → `"1:05"`, `3725` → `"1:02:05"`. */
export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * Workout for a diary day:
 * - a workout already done that day;
 * - otherwise, in weekly mode, the workout of that day of the week;
 * - otherwise, in queue mode, the next workout in the queue, for today and
 *   later days only (past days without a workout stay empty).
 */
export function getWorkoutForDate(
  plan: WorkoutPlan,
  workouts: Workout[],
  completions: WorkoutCompletion[],
  date: string,
  today: string,
): { workout: Workout; done: boolean } | undefined {
  const find = (id: string | undefined) => workouts.find((workout) => workout.id === id);

  const completed = completions.find((completion) => completion.date === date);
  const doneWorkout = completed && find(completed.workoutId);
  if (doneWorkout) return { workout: doneWorkout, done: true };

  if (plan.mode === 'weekly') {
    const workout = find(plan.weekly[fromDateKey(date).getDay() as Weekday]);
    return workout && { workout, done: false };
  }

  if (date < today || plan.queue.length === 0) return undefined;
  const workout = find(plan.queue[plan.queueIndex % plan.queue.length]);
  return workout && { workout, done: false };
}

/** `"4 × 10 · 20 kg"` or `"30 min"`. */
export function describePlanned(exercise: NewPlannedExercise) {
  if (exercise.category === 'cardio') return `${exercise.minutes} min`;
  const load = exercise.weightKg > 0 ? ` · ${exercise.weightKg.toLocaleString('pt-BR')} kg` : '';
  return `${exercise.sets} × ${exercise.reps}${load}`;
}
