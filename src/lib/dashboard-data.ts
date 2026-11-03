export type MacroKey = 'carbs' | 'protein' | 'fat';

export type DashboardData = {
  calories: {
    /** Daily calorie goal (kcal). */
    goal: number;
    /** Calories logged from food today (kcal). */
    food: number;
    /** Calories burned by logged exercise today (kcal). */
    exercise: number;
  };
  /** Grams consumed and daily goal per macronutrient. */
  macros: Record<MacroKey, { consumed: number; goal: number }>;
  steps: { count: number; goal: number };
  /** Calories burned and minutes of exercise today, and the daily burn goal (kcal). */
  exercise: { calories: number; minutes: number; goal: number };
};

/**
 * TEMPORARY: static data so the home dashboard can be built without a
 * backend. Replace with the real diary / activity source once it exists.
 */
export const MOCK_DASHBOARD: DashboardData = {
  calories: { goal: 2200, food: 1340, exercise: 320 },
  macros: {
    carbs: { consumed: 145, goal: 275 },
    protein: { consumed: 92, goal: 110 },
    fat: { consumed: 41, goal: 73 },
  },
  steps: { count: 6840, goal: 10000 },
  exercise: { calories: 320, minutes: 45, goal: 400 },
};
