import { StyleSheet, View } from "react-native";

import { AppIcon } from "@/components/app-logo";
import { ActivityCards } from "@/components/dashboard/activity-cards";
import { CaloriesCard } from "@/components/dashboard/calories-card";
import { MacrosCard } from "@/components/dashboard/macros-card";
import { WeightCard } from "@/components/dashboard/weight-card";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useExerciseDay } from "@/context/exercise-log";
import { useFoodDay } from "@/context/food-log";
import { MOCK_DASHBOARD } from "@/lib/dashboard-data";
import { toDateKey } from "@/lib/exercises";

export default function HomeScreen() {
  // TODO: load steps and weight from the real sources.
  const data = MOCK_DASHBOARD;
  const today = toDateKey(new Date());
  const exerciseDay = useExerciseDay(today);
  const exercise = { calories: exerciseDay.calories, minutes: exerciseDay.minutes };
  const food = useFoodDay(today).totals;
  const macros = {
    carbs: { ...data.macros.carbs, consumed: Math.round(food.carbs) },
    protein: { ...data.macros.protein, consumed: Math.round(food.protein) },
    fat: { ...data.macros.fat, consumed: Math.round(food.fat) },
  };

  return (
    <TabScreen header={<AppIcon />}>
      <View style={styles.welcome}>
        <ThemedText type="subtitle" accessibilityRole="header">
          Hoje
        </ThemedText>
      </View>

      <CaloriesCard
        calories={{ ...data.calories, food: Math.round(food.kcal), exercise: exercise.calories }}
      />
      <MacrosCard macros={macros} />
      <ActivityCards steps={data.steps} exercise={exercise} />
      <WeightCard weight={data.weight} />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  welcome: {
    gap: Spacing.one,
  },
});
