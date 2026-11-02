import { getCachedOpenFoodFactsFood } from './openfoodfacts';
import { getTacoFood } from './taco';

export type FoodSource = 'taco' | 'off';

/** Energy and macronutrients; grams except `kcal`. */
export type Nutrients = {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  /** Not every product reports fiber. */
  fiber?: number;
};

export type Food = {
  /** `taco:<id>` or `off:<barcode>`, unique across sources. */
  id: string;
  source: FoodSource;
  name: string;
  /** Brand (Open Food Facts) or food group (TACO). */
  detail?: string;
  per100g: Nutrients;
  /** Grams in one serving, when the product label states it. */
  servingGrams?: number;
};

/** A diary meal; the user picks which ones the diary shows. */
export type Meal = {
  /** Preset key (e.g. `breakfast`) or `custom-…` for meals named by the user. */
  id: string;
  name: string;
};

/** Meals offered ready-made, in the order of the day. */
export const PRESET_MEALS: readonly Meal[] = [
  { id: 'breakfast', name: 'Café da manhã' },
  { id: 'morning-snack', name: 'Lanche da manhã' },
  { id: 'lunch', name: 'Almoço' },
  { id: 'snack', name: 'Lanche' },
  { id: 'pre-workout', name: 'Pré-treino' },
  { id: 'post-workout', name: 'Pós-treino' },
  { id: 'dinner', name: 'Jantar' },
  { id: 'supper', name: 'Ceia' },
];

/** Meals the diary starts with. */
export const DEFAULT_MEALS: readonly Meal[] = PRESET_MEALS.filter((meal) =>
  ['breakfast', 'lunch', 'snack', 'dinner'].includes(meal.id),
);

const presetRank = (id: string) => PRESET_MEALS.findIndex((meal) => meal.id === id);

/**
 * Adds `meal` to `meals`. A preset goes before the first preset that comes
 * later in the day, so the diary keeps the order of the day; anything else
 * goes at the end.
 */
export function insertMeal(meals: readonly Meal[], meal: Meal): Meal[] {
  const rank = presetRank(meal.id);
  const index = rank === -1 ? -1 : meals.findIndex((other) => presetRank(other.id) > rank);
  return index === -1 ? [...meals, meal] : [...meals.slice(0, index), meal, ...meals.slice(index)];
}

/** Food from either source, if it is in TACO or was already loaded this session. */
export function getFood(id: string): Food | undefined {
  const [source, key] = splitFoodId(id);
  if (source === 'taco') return getTacoFood(Number(key));
  if (source === 'off') return getCachedOpenFoodFactsFood(key);
  return undefined;
}

function splitFoodId(id: string) {
  const index = id.indexOf(':');
  return [id.slice(0, index), id.slice(index + 1)] as const;
}

/** Nutrients of `grams` of a food whose values are given per 100 g. */
export function scaleNutrients(per100g: Nutrients, grams: number): Nutrients {
  const factor = grams / 100;
  return {
    kcal: per100g.kcal * factor,
    carbs: per100g.carbs * factor,
    protein: per100g.protein * factor,
    fat: per100g.fat * factor,
    fiber: per100g.fiber === undefined ? undefined : per100g.fiber * factor,
  };
}

export const EMPTY_NUTRIENTS: Nutrients = { kcal: 0, carbs: 0, protein: 0, fat: 0 };

export function sumNutrients(list: Nutrients[]): Nutrients {
  return list.reduce(
    (sum, item) => ({
      kcal: sum.kcal + item.kcal,
      carbs: sum.carbs + item.carbs,
      protein: sum.protein + item.protein,
      fat: sum.fat + item.fat,
    }),
    EMPTY_NUTRIENTS,
  );
}

export type FoodEntry = {
  id: string;
  /** Diary day as `YYYY-MM-DD` (local time). */
  date: string;
  /** `Meal.id`. */
  meal: string;
  /** Kept so the entry still shows its meal after that meal is removed. */
  mealName: string;
  foodId: string;
  source: FoodSource;
  name: string;
  detail?: string;
  grams: number;
  /** Already scaled to `grams`. */
  nutrients: Nutrients;
};

export type NewFoodEntry = Omit<FoodEntry, 'id'>;
