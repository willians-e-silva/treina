import type { Json, Tables } from '../database.types';
import type { WorkoutPlanRepository } from '../types';
import { done, inList, maybe, must, selectAll, supabase } from './client';

import {
  EMPTY_PLAN,
  WEEKDAYS,
  type Feeling,
  type PlannedExercise,
  type Weekday,
  type Workout,
  type WorkoutPlan,
} from '@/lib/workouts';

type WorkoutRow = Tables<'workouts'> & {
  planned_exercises: Tables<'planned_exercises'>[];
  training_packages: { trainer_id: string } | null;
};

function toExercise(row: Tables<'planned_exercises'>): PlannedExercise {
  const base = {
    id: row.id,
    name: row.name,
    met: row.met === null ? undefined : Number(row.met),
    note: row.note ?? undefined,
  };
  return row.category === 'cardio'
    ? { ...base, category: 'cardio', minutes: row.minutes ?? 0 }
    : {
        ...base,
        category: 'strength',
        sets: row.sets ?? 0,
        reps: row.reps ?? 0,
        weightKg: Number(row.weight_kg ?? 0),
      };
}

function toWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    name: row.name,
    summary: row.summary ?? undefined,
    description: row.description ?? undefined,
    exercises: [...row.planned_exercises].sort((a, b) => a.position - b.position).map(toExercise),
    source:
      row.source_package_id && row.training_packages
        ? { trainerId: row.training_packages.trainer_id, packageId: row.source_package_id }
        : undefined,
  };
}

/** `weekly` is stored as `{ "1": workoutId, … }`; days that are not weekdays are dropped. */
function toWeekly(json: Json): WorkoutPlan['weekly'] {
  const weekly: WorkoutPlan['weekly'] = {};
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    for (const day of WEEKDAYS) {
      const id = json[String(day)];
      if (typeof id === 'string') weekly[day as Weekday] = id;
    }
  }
  return weekly;
}

/**
 * `workouts` with their `planned_exercises`, the plan in `workout_plans` and
 * the days done in `workout_completions`.
 */
export function workoutPlanRepository(userId: string): WorkoutPlanRepository {
  return {
    async load() {
      const [workouts, plan, completions] = await Promise.all([
        supabase
          .from('workouts')
          .select('*, planned_exercises(*), training_packages(trainer_id)')
          .eq('user_id', userId)
          .order('created_at'),
        supabase.from('workout_plans').select('*').eq('user_id', userId).maybeSingle(),
        selectAll((from, to) =>
          supabase
            .from('workout_completions')
            .select('*')
            .eq('user_id', userId)
            .order('date')
            .range(from, to),
        ),
      ]);
      const planRow = maybe(plan);
      return {
        workouts: must(workouts).map(toWorkout),
        plan: planRow
          ? {
              mode: planRow.mode === 'queue' ? 'queue' : 'weekly',
              weekly: toWeekly(planRow.weekly),
              queue: planRow.queue,
              queueIndex: planRow.queue_index,
            }
          : EMPTY_PLAN,
        completions: completions.map((row) => ({
          date: row.date,
          workoutId: row.workout_id,
          session:
            row.duration_seconds === null || row.feeling === null
              ? undefined
              : { durationSeconds: row.duration_seconds, feeling: row.feeling as Feeling },
        })),
      };
    },

    async saveWorkouts(workouts) {
      if (workouts.length === 0) return;
      done(
        await supabase.from('workouts').upsert(
          workouts.map((workout) => ({
            id: workout.id,
            user_id: userId,
            name: workout.name,
            summary: workout.summary ?? null,
            description: workout.description ?? null,
            source_package_id: workout.source?.packageId ?? null,
          })),
        ),
      );

      const exercises = workouts.flatMap((workout) =>
        workout.exercises.map((exercise, position) => ({
          id: exercise.id,
          workout_id: workout.id,
          user_id: userId,
          position,
          name: exercise.name,
          category: exercise.category,
          met: exercise.met ?? null,
          note: exercise.note ?? null,
          minutes: exercise.category === 'cardio' ? exercise.minutes : null,
          sets: exercise.category === 'strength' ? exercise.sets : null,
          reps: exercise.category === 'strength' ? exercise.reps : null,
          weight_kg: exercise.category === 'strength' ? exercise.weightKg : null,
        })),
      );
      if (exercises.length > 0) {
        done(await supabase.from('planned_exercises').upsert(exercises));
      }
      // Exercises taken out of the workouts.
      for (const workout of workouts) {
        let removed = supabase.from('planned_exercises').delete().eq('workout_id', workout.id);
        if (workout.exercises.length > 0) {
          removed = removed.not(
            'id',
            'in',
            inList(workout.exercises.map((exercise) => exercise.id)),
          );
        }
        done(await removed);
      }
    },

    async removeWorkout(id) {
      // Its exercises and completed days go with it (`on delete cascade`).
      done(await supabase.from('workouts').delete().eq('id', id));
    },

    async savePlan(plan) {
      done(
        await supabase.from('workout_plans').upsert({
          user_id: userId,
          mode: plan.mode,
          weekly: plan.weekly,
          queue: plan.queue,
          queue_index: plan.queueIndex,
        }),
      );
    },

    async saveCompletion({ date, workoutId, session }) {
      done(
        await supabase.from('workout_completions').upsert(
          {
            user_id: userId,
            date,
            workout_id: workoutId,
            duration_seconds: session?.durationSeconds ?? null,
            feeling: session?.feeling ?? null,
          },
          { onConflict: 'user_id,date' },
        ),
      );
    },

    async removeCompletion(date) {
      done(
        await supabase.from('workout_completions').delete().eq('user_id', userId).eq('date', date),
      );
    },
  };
}
