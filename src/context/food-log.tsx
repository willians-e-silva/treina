import { createContext, use, type PropsWithChildren } from 'react';

import { useSession } from './session';

import { createId } from '@/data/ids';
import type { FoodLogData, Repositories } from '@/data/types';
import { useUserStore, type StoreStatus } from '@/data/use-user-store';
import {
  DEFAULT_MEALS,
  insertMeal,
  PRESET_MEALS,
  sumNutrients,
  type FoodEntry,
  type Meal,
  type NewFoodEntry,
} from '@/lib/foods';

type FoodLogContextValue = {
  status: StoreStatus;
  retry: () => void;
  /** A change could not be saved; `retrySave` sends it again. */
  saveFailed: boolean;
  retrySave: () => void;
  entries: FoodEntry[];
  addEntry: (entry: NewFoodEntry) => void;
  removeEntry: (id: string) => void;
  /** Puts back an entry just removed ("Desfazer"), with its id. */
  restoreEntry: (entry: FoodEntry) => void;
  /** Meals shown in the diary, in order. */
  meals: Meal[];
  /** Adds a preset by id, or a custom meal by name. */
  addMeal: (meal: { presetId: string } | { name: string }) => void;
  /**
   * Hides a meal from the diary. Foods already logged in it stay in their
   * days, under the meal's name.
   */
  removeMeal: (id: string) => void;
};

const FoodLogContext = createContext<FoodLogContextValue | null>(null);

export function useFoodLog() {
  const value = use(FoodLogContext);
  if (!value) {
    throw new Error('useFoodLog must be wrapped in a <FoodLogProvider />');
  }
  return value;
}

/**
 * Entries of one diary day by meal, plus the day's totals. Meals removed
 * from the diary still get a section on days where they have foods.
 */
export function useFoodDay(date: string) {
  const { entries, meals } = useFoodLog();
  const day = entries.filter((entry) => entry.date === date);
  const sections = meals.map((meal) => ({
    meal,
    removed: false,
    entries: day.filter((entry) => entry.meal === meal.id),
  }));
  for (const entry of day) {
    let section = sections.find((candidate) => candidate.meal.id === entry.meal);
    if (!section) {
      section = { meal: { id: entry.meal, name: entry.mealName }, removed: true, entries: [] };
      sections.push(section);
    }
    if (section.removed) section.entries.push(entry);
  }

  return {
    sections,
    totals: sumNutrients(day.map((entry) => entry.nutrients)),
  };
}

const EMPTY: FoodLogData = { entries: [], meals: [...DEFAULT_MEALS] };
const load = (repositories: Repositories) => repositories.foodLog.load();

/** Food diary of the signed-in account. Must sit inside `SessionProvider`. */
export function FoodLogProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const store = useUserStore(session, EMPTY, load);

  function addEntry(entry: NewFoodEntry) {
    const created: FoodEntry = { ...entry, id: createId() };
    store.update((data) => ({ ...data, entries: [...data.entries, created] }));
    store.write((repositories) => repositories.foodLog.addEntry(created));
  }

  function removeEntry(id: string) {
    store.update((data) => ({ ...data, entries: data.entries.filter((entry) => entry.id !== id) }));
    store.write((repositories) => repositories.foodLog.removeEntry(id));
  }

  function restoreEntry(entry: FoodEntry) {
    store.update((data) => ({ ...data, entries: [...data.entries, entry] }));
    store.write((repositories) => repositories.foodLog.addEntry(entry));
  }

  function addMeal(input: { presetId: string } | { name: string }) {
    const meal =
      'presetId' in input
        ? PRESET_MEALS.find((preset) => preset.id === input.presetId)
        : { id: `custom-${createId()}`, name: input.name.trim() };
    if (!meal?.name) return;
    let added = false;
    const { meals } = store.update((data) => {
      if (data.meals.some((other) => other.id === meal.id)) return data;
      added = true;
      return { ...data, meals: insertMeal(data.meals, meal) };
    });
    if (added) store.write((repositories) => repositories.foodLog.saveMeals(meals));
  }

  function removeMeal(id: string) {
    const { meals } = store.update((data) => ({
      ...data,
      meals: data.meals.filter((meal) => meal.id !== id),
    }));
    store.write((repositories) => repositories.foodLog.saveMeals(meals));
  }

  return (
    <FoodLogContext
      value={{
        status: store.status,
        retry: store.retry,
        saveFailed: store.saveFailed,
        retrySave: store.retrySave,
        entries: store.data.entries,
        addEntry,
        removeEntry,
        restoreEntry,
        meals: store.data.meals,
        addMeal,
        removeMeal,
      }}>
      {children}
    </FoodLogContext>
  );
}
