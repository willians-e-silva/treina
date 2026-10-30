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

export type MealKey = 'breakfast' | 'lunch' | 'snack' | 'dinner';

/** Order here is the order of the diary sections. */
export const MEALS: readonly MealKey[] = ['breakfast', 'lunch', 'snack', 'dinner'];

export const MEAL_LABELS: Record<MealKey, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
};

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
  meal: MealKey;
  foodId: string;
  source: FoodSource;
  name: string;
  detail?: string;
  grams: number;
  /** Already scaled to `grams`. */
  nutrients: Nutrients;
};

export type NewFoodEntry = Omit<FoodEntry, 'id'>;
