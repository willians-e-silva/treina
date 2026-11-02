import { createContext, use, useState, type PropsWithChildren } from 'react';

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
  entries: FoodEntry[];
  addEntry: (entry: NewFoodEntry) => void;
  removeEntry: (id: string) => void;
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

/** Meal by id among the diary's meals, if it is still there. */
export function useMeal(id: string | undefined) {
  const { meals } = useFoodLog();
  return meals.find((meal) => meal.id === id);
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

let nextId = 0;
function createId() {
  nextId += 1;
  return `${Date.now()}-${nextId}`;
}

/**
 * TEMPORARY: in-memory log until there is a backend. Entries and meals are
 * lost when the app restarts.
 */
export function FoodLogProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [meals, setMeals] = useState<Meal[]>([...DEFAULT_MEALS]);

  function addEntry(entry: NewFoodEntry) {
    setEntries((current) => [...current, { ...entry, id: createId() }]);
  }

  function removeEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function addMeal(input: { presetId: string } | { name: string }) {
    const meal =
      'presetId' in input
        ? PRESET_MEALS.find((preset) => preset.id === input.presetId)
        : { id: `custom-${createId()}`, name: input.name.trim() };
    if (!meal?.name) return;
    setMeals((current) =>
      current.some((other) => other.id === meal.id) ? current : insertMeal(current, meal),
    );
  }

  function removeMeal(id: string) {
    setMeals((current) => current.filter((meal) => meal.id !== id));
  }

  return (
    <FoodLogContext value={{ entries, addEntry, removeEntry, meals, addMeal, removeMeal }}>
      {children}
    </FoodLogContext>
  );
}
