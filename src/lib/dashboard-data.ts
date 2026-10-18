export type MacroKey = "carbs" | "protein" | "fat";

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
  exercise: { calories: number; minutes: number };
  /** Weigh-ins in kg, oldest first. */
  weight: { date: string; kg: number }[];
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
  exercise: { calories: 320, minutes: 45 },
  weight: [
    { date: "2026-07-20", kg: 84.6 },
    { date: "2026-08-03", kg: 84.1 },
    { date: "2026-08-17", kg: 83.8 },
    { date: "2026-08-31", kg: 83.9 },
    { date: "2026-09-14", kg: 83.2 },
    { date: "2026-09-28", kg: 82.7 },
    { date: "2026-10-12", kg: 82.4 },
    { date: "2026-10-18", kg: 82.1 },
  ],
};
