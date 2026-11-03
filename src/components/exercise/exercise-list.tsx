import Dumbbell from 'lucide-react-native/icons/dumbbell';
import HeartPulse from 'lucide-react-native/icons/heart-pulse';
import ListChecks from 'lucide-react-native/icons/list-checks';
import Trash from 'lucide-react-native/icons/trash';
import { StyleSheet, View } from 'react-native';

import { formatDecimal, formatInt } from '@/components/dashboard/format';
import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useExerciseLog } from '@/context/exercise-log';
import { useAppTheme } from '@/theme';
import { CATEGORY_LABELS, type ExerciseEntry } from '@/lib/exercises';

type ExerciseListProps = {
  /** The day's entries, cardio and strength together. */
  entries: ExerciseEntry[];
};

/** The exercises logged on a day; new ones are added from the screen's FAB. */
export function ExerciseList({ entries }: ExerciseListProps) {
  const { colors, custom } = useAppTheme();
  const { removeEntry } = useExerciseLog();

  return (
    <Surface style={styles.container}>
      <View style={styles.title}>
        <ListChecks color={colors.onSurfaceVariant} size={20} aria-hidden />
        <ThemedText type="titleSmall" accessibilityRole="header">
          Exercícios do dia
        </ThemedText>
      </View>

      {entries.length === 0 ? (
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          Nenhum exercício registrado.
        </ThemedText>
      ) : (
        entries.map((entry) => {
          const cardio = entry.category === 'cardio';
          const Icon = cardio ? HeartPulse : Dumbbell;
          return (
            <View key={entry.id} style={[styles.row, { borderTopColor: colors.outlineVariant }]}>
              <Icon
                color={cardio ? custom.exercise.color : custom.protein.color}
                size={20}
                accessibilityLabel={CATEGORY_LABELS[entry.category]}
              />
              <View style={styles.rowText}>
                <ThemedText numberOfLines={1}>{entry.name}</ThemedText>
                <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
                  {describeEntry(entry)}
                </ThemedText>
              </View>
              {entry.category === 'cardio' && (
                <ThemedText type="titleSmall">{formatInt(entry.calories)} kcal</ThemedText>
              )}
              <IconButton
                icon={Trash}
                onPress={() => removeEntry(entry.id)}
                accessibilityLabel={`Remover ${entry.name}`}
              />
            </View>
          );
        })
      )}
    </Surface>
  );
}

function describeEntry(entry: ExerciseEntry) {
  if (entry.category === 'cardio') {
    return `${formatInt(entry.minutes)} min`;
  }
  const load = entry.weightKg > 0 ? ` · ${formatDecimal(entry.weightKg)} kg` : '';
  return `${entry.sets} séries × ${entry.reps} reps${load}`;
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
  },
});
