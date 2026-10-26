import { StyleSheet, View } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ActivityCards } from "@/components/dashboard/activity-cards";
import { CaloriesCard } from "@/components/dashboard/calories-card";
import { MacrosCard } from "@/components/dashboard/macros-card";
import { WeightCard } from "@/components/dashboard/weight-card";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useExerciseDay } from "@/context/exercise-log";
import { MOCK_DASHBOARD } from "@/lib/dashboard-data";
import { toDateKey } from "@/lib/exercises";

export default function HomeScreen() {
  // TODO: load food and weight from the real diary source.
  const data = MOCK_DASHBOARD;
  const exerciseDay = useExerciseDay(toDateKey(new Date()));
  const exercise = { calories: exerciseDay.calories, minutes: exerciseDay.minutes };

  return (
    <TabScreen header={<AppLogo />}>
      <View style={styles.welcome}>
        <ThemedText type="subtitle" accessibilityRole="header">
          Hoje
        </ThemedText>
      </View>

      <CaloriesCard calories={{ ...data.calories, exercise: exercise.calories }} />
      <MacrosCard macros={data.macros} />
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
