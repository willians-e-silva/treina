import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Footprints from 'lucide-react-native/icons/footprints';
import { StyleSheet } from 'react-native';

import { CardTitle } from './card-title';
import { formatInt } from './format';
import { ProgressBar } from './progress-bar';

import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import type { DashboardData } from '@/lib/dashboard-data';
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

/** Calories burned and minutes of today's logged exercise. */
export function ExerciseTile({ exercise }: Pick<DashboardData, 'exercise'>) {
  const { custom } = useAppTheme();

  return (
    <Surface style={styles.tile}>
      <CardTitle icon={Dumbbell} color={custom.exercise.color}>
        Exercício
      </CardTitle>
      <ThemedText type="headlineSmall" emphasized>
        {formatInt(exercise.calories)}
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          {' '}
          kcal
        </ThemedText>
      </ThemedText>
      <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
        {formatInt(exercise.minutes)} min
      </ThemedText>
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
});
