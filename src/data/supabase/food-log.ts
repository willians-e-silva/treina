import type { Tables } from '../database.types';
import type { FoodLogRepository } from '../types';
import { done, inList, must, selectAll, supabase } from './client';

import type { FoodEntry, FoodSource } from '@/lib/foods';

function toEntry(row: Tables<'food_entries'>): FoodEntry {
  return {
    id: row.id,
    date: row.date,
    meal: row.meal_key,
    mealName: row.meal_name,
    foodId: row.food_id,
    source: row.source as FoodSource,
    name: row.name,
    detail: row.detail ?? undefined,
    grams: Number(row.grams),
    nutrients: {
      kcal: Number(row.kcal),
      carbs: Number(row.carbs),
      protein: Number(row.protein),
      fat: Number(row.fat),
      fiber: row.fiber === null ? undefined : Number(row.fiber),
    },
  };
}

/** `food_entries`, and the diary's meals in `meals` (ordered by `position`). */
export function foodLogRepository(userId: string): FoodLogRepository {
  return {
    async load() {
      const [entries, meals] = await Promise.all([
        selectAll((from, to) =>
          supabase
            .from('food_entries')
            .select('*')
            .eq('user_id', userId)
            .order('date')
            .order('created_at')
            .range(from, to),
        ),
        supabase.from('meals').select('key, name').eq('user_id', userId).order('position'),
      ]);
      return {
        entries: entries.map(toEntry),
        meals: must(meals).map((meal) => ({ id: meal.key, name: meal.name })),
      };
    },

    async addEntry(entry) {
      const { nutrients } = entry;
      done(
        await supabase.from('food_entries').insert({
          id: entry.id,
          user_id: userId,
          date: entry.date,
          meal_key: entry.meal,
          meal_name: entry.mealName,
          food_id: entry.foodId,
          source: entry.source,
          name: entry.name,
          detail: entry.detail ?? null,
          grams: entry.grams,
          kcal: nutrients.kcal,
          carbs: nutrients.carbs,
          protein: nutrients.protein,
          fat: nutrients.fat,
          fiber: nutrients.fiber ?? null,
        }),
      );
    },

    async removeEntry(id) {
      done(await supabase.from('food_entries').delete().eq('id', id));
    },

    async saveMeals(meals) {
      if (meals.length > 0) {
        done(
          await supabase.from('meals').upsert(
            meals.map((meal, position) => ({
              user_id: userId,
              key: meal.id,
              name: meal.name,
              position,
            })),
            { onConflict: 'user_id,key' },
          ),
        );
      }
      let removed = supabase.from('meals').delete().eq('user_id', userId);
      if (meals.length > 0) {
        removed = removed.not('key', 'in', inList(meals.map((meal) => meal.id)));
      }
      done(await removed);
    },
  };
}
