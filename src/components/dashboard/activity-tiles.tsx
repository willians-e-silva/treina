import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Footprints from 'lucide-react-native/icons/footprints';
import { StyleSheet, View } from 'react-native';

import { CardTitle } from './card-title';
import { formatInt } from './format';
import { ProgressBar } from './progress-bar';

import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useExerciseLog } from '@/context/exercise-log';
import { useWorkoutPlan } from '@/context/workout-plan';
import type { DashboardData } from '@/lib/dashboard-data';
import { toDateKey } from '@/lib/exercises';
import { getWorkoutForDate } from '@/lib/workouts';
import { useAppTheme } from '@/theme';

/**
 * Half-width tiles: the dashboard places two of them side by side when they
 * come one after the other.
 */

/** Today's steps against the goal. */
export function StepsTile({ steps }: Pick<DashboardData, 'steps'>) {
  const { custom } = useAppTheme();

  return (
    <Surface style={styles.tile}>
      <CardTitle icon={Footprints} color={custom.steps.color}>
        Passos
      </CardTitle>
      <ThemedText type="headlineSmall" emphasized>
        {formatInt(steps.count)}
      </ThemedText>
      <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
        Meta: {formatInt(steps.goal)}
      </ThemedText>
      <ProgressBar progress={steps.count / steps.goal} color={custom.steps.color} />
    </Surface>
  );
}

/**
 * Today's exercises (done out of planned, or how many were logged when no
 * workout is planned) and calories burned against the daily burn goal.
 */
export function ExerciseTile({
  exercise,
  date,
}: Pick<DashboardData, 'exercise'> & { date: string }) {
  const { colors, custom } = useAppTheme();
  const { workouts, plan, completions } = useWorkoutPlan();
  const { entries } = useExerciseLog();
  const current = getWorkoutForDate(plan, workouts, completions, date, toDateKey(new Date()));
  const planned = current?.workout.exercises ?? [];
  const done = planned.filter((item) =>
    entries.some((entry) => entry.date === date && entry.plannedId === item.id),
  ).length;
  const logged = entries.filter((entry) => entry.date === date).length;
  const progress = planned.length > 0 ? done / planned.length : 0;

  return (
    <Surface style={styles.tile}>
      <CardTitle icon={Dumbbell} color={custom.exercise.color}>
        Exercício
      </CardTitle>
      {planned.length > 0 ? (
        <View
          style={styles.progress}
          accessible
          accessibilityLabel={`${done} de ${planned.length} exercícios concluídos, ${Math.round(progress * 100)}%`}>
          <ThemedText type="headlineSmall" emphasized>
            {done}
            <ThemedText type="titleMedium" themeColor="onSurfaceVariant">
              /{planned.length}
            </ThemedText>
          </ThemedText>
          <View style={styles.burnLabel}>
            <ThemedText type="labelMedium" themeColor="onSurfaceVariant" style={styles.flex}>
              exercícios concluídos
            </ThemedText>
            <ThemedText type="labelMedium" themeColor="onSurfaceVariant">
              {Math.round(progress * 100)}%
            </ThemedText>
          </View>
          <ProgressBar progress={progress} color={colors.tertiary} />
        </View>
      ) : (
        <View>
          <ThemedText type="headlineSmall" emphasized>
            {formatInt(logged)}
          </ThemedText>
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {logged === 1 ? 'exercício registrado' : 'exercícios registrados'}
          </ThemedText>
        </View>
      )}
      <View
        style={styles.burn}
        accessible
        accessibilityLabel={`Calorias queimadas: ${formatInt(exercise.calories)} de ${formatInt(exercise.goal)}`}>
        <View style={styles.burnLabel}>
          <ThemedText type="labelMedium" themeColor="onSurfaceVariant">
            Calorias
          </ThemedText>
          <ThemedText type="labelMedium" themeColor="onSurfaceVariant">
            {formatInt(exercise.calories)}/{formatInt(exercise.goal)} kcal
          </ThemedText>
        </View>
        <ProgressBar progress={exercise.calories / exercise.goal} color={custom.exercise.color} />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignSelf: 'stretch',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  progress: {
    gap: Spacing.one,
  },
  flex: {
    flex: 1,
  },
  burn: {
    gap: Spacing.one,
    // Keeps the bar at the bottom when the tile stretches to its neighbour's height.
    marginTop: 'auto',
  },
  burnLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
});
