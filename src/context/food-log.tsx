import { createContext, use, useState, type PropsWithChildren } from 'react';

import {
  MEALS,
  sumNutrients,
  type FoodEntry,
  type MealKey,
  type NewFoodEntry,
} from '@/lib/foods';

type FoodLogContextValue = {
  entries: FoodEntry[];
  addEntry: (entry: NewFoodEntry) => void;
  removeEntry: (id: string) => void;
};

const FoodLogContext = createContext<FoodLogContextValue | null>(null);

export function useFoodLog() {
  const value = use(FoodLogContext);
  if (!value) {
    throw new Error('useFoodLog must be wrapped in a <FoodLogProvider />');
  }
  return value;
}

/** Entries of one diary day by meal, plus the day's totals. */
export function useFoodDay(date: string) {
  const { entries } = useFoodLog();
  const day = entries.filter((entry) => entry.date === date);
  const meals = Object.fromEntries(
    MEALS.map((meal) => [meal, day.filter((entry) => entry.meal === meal)]),
  ) as Record<MealKey, FoodEntry[]>;

  return {
    meals,
    totals: sumNutrients(day.map((entry) => entry.nutrients)),
  };
}

let nextId = 0;
function createId() {
  nextId += 1;
  return `${Date.now()}-${nextId}`;
}

/**
 * TEMPORARY: in-memory log until there is a backend. Entries are lost when
 * the app restarts.
 */
export function FoodLogProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<FoodEntry[]>([]);

  function addEntry(entry: NewFoodEntry) {
    setEntries((current) => [...current, { ...entry, id: createId() }]);
  }

  function removeEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return <FoodLogContext value={{ entries, addEntry, removeEntry }}>{children}</FoodLogContext>;
}
