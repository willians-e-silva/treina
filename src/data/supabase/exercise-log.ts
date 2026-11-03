import type { Tables } from '../database.types';
import type { ExerciseLogRepository } from '../types';
import { done, selectAll, supabase } from './client';

import type { ExerciseEntry } from '@/lib/exercises';

function toEntry(row: Tables<'exercise_entries'>): ExerciseEntry {
  const base = {
    id: row.id,
    date: row.date,
    name: row.name,
    plannedId: row.planned_exercise_id ?? undefined,
  };
  return row.category === 'cardio'
    ? { ...base, category: 'cardio', minutes: row.minutes ?? 0, calories: row.calories ?? 0 }
    : {
        ...base,
        category: 'strength',
        sets: row.sets ?? 0,
        reps: row.reps ?? 0,
        weightKg: Number(row.weight_kg ?? 0),
      };
}

/** `exercise_entries`. */
export function exerciseLogRepository(userId: string): ExerciseLogRepository {
  return {
    async list() {
      const rows = await selectAll((from, to) =>
        supabase
          .from('exercise_entries')
          .select('*')
          .eq('user_id', userId)
          .order('date')
          .order('created_at')
          .range(from, to),
      );
      return rows.map(toEntry);
    },

    async add(entry) {
      done(
        await supabase.from('exercise_entries').insert({
          id: entry.id,
          user_id: userId,
          date: entry.date,
          name: entry.name,
          category: entry.category,
          planned_exercise_id: entry.plannedId ?? null,
          ...(entry.category === 'cardio'
            ? { minutes: entry.minutes, calories: entry.calories }
            : { sets: entry.sets, reps: entry.reps, weight_kg: entry.weightKg }),
        }),
      );
    },

    async remove(id) {
      done(await supabase.from('exercise_entries').delete().eq('id', id));
    },
  };
}
