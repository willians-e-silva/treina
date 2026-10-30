import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Footprints from 'lucide-react-native/icons/footprints';
import { StyleSheet, View } from 'react-native';

import { formatInt } from './format';
import { ProgressBar } from './progress-bar';

import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/theme';
import type { DashboardData } from '@/lib/dashboard-data';

type ActivityCardsProps = Pick<DashboardData, 'steps' | 'exercise'>;

/** Side-by-side tiles for today's steps and exercise. */
export function ActivityCards({ steps, exercise }: ActivityCardsProps) {
  const { custom } = useAppTheme();

  return (
    <View style={styles.row}>
      <Surface style={styles.tile}>
        <View style={styles.title}>
          <Footprints color={custom.steps.color} size={20} aria-hidden />
          <ThemedText type="titleSmall">Passos</ThemedText>
        </View>
        <ThemedText type="headlineSmall" emphasized>
          {formatInt(steps.count)}
        </ThemedText>
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          Meta: {formatInt(steps.goal)}
        </ThemedText>
        <ProgressBar progress={steps.count / steps.goal} color={custom.steps.color} />
      </Surface>

      <Surface style={styles.tile}>
        <View style={styles.title}>
          <Dumbbell color={custom.exercise.color} size={20} aria-hidden />
          <ThemedText type="titleSmall">Exercício</ThemedText>
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  tile: {
    flex: 1,
    alignSelf: 'auto',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
});
