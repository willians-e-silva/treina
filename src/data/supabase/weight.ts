import type { WeightRepository } from '../types';
import { done, must, selectAll, supabase } from './client';

/** `weigh_ins`, and the goal in `profiles.goal_weight_kg`. */
export function weightRepository(userId: string): WeightRepository {
  return {
    async load() {
      const [weighIns, profile] = await Promise.all([
        selectAll((from, to) =>
          supabase
            .from('weigh_ins')
            .select('date, kg')
            .eq('user_id', userId)
            .order('date')
            .range(from, to),
        ),
        supabase.from('profiles').select('goal_weight_kg').eq('id', userId).single(),
      ]);
      const goal = must(profile).goal_weight_kg;
      return {
        entries: weighIns.map((row) => ({ date: row.date, kg: Number(row.kg) })),
        goalKg: goal === null ? undefined : Number(goal),
      };
    },

    async saveWeighIn({ date, kg }) {
      done(
        await supabase
          .from('weigh_ins')
          .upsert({ user_id: userId, date, kg }, { onConflict: 'user_id,date' }),
      );
    },

    async setGoal(kg) {
      done(
        await supabase
          .from('profiles')
          .update({ goal_weight_kg: kg ?? null })
          .eq('id', userId),
      );
    },
  };
}
