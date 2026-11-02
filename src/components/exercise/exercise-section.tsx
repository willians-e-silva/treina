import { router } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { StyleSheet, View } from 'react-native';

import { formatDecimal, formatInt } from '@/components/dashboard/format';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useExerciseLog } from '@/context/exercise-log';
import { useAppTheme } from '@/theme';
import { CATEGORY_LABELS, type ExerciseCategory, type ExerciseEntry } from '@/lib/exercises';

type ExerciseSectionProps = {
  category: ExerciseCategory;
  icon: LucideIcon;
  color: string;
  date: string;
  entries: ExerciseEntry[];
  /** Shown on the right of the section title, e.g. the total kcal. */
  summary?: string;
};

/** One diary section (cardio or strength) with its entries and an add button. */
export function ExerciseSection({
  category,
  icon: Icon,
  color,
  date,
  entries,
  summary,
}: ExerciseSectionProps) {
  const { colors } = useAppTheme();
  const { removeEntry } = useExerciseLog();

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <View style={styles.title}>
          <Icon color={color} size={20} aria-hidden />
          <ThemedText type="titleSmall" accessibilityRole="header">
            {CATEGORY_LABELS[category]}
          </ThemedText>
        </View>
        {summary && (
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {summary}
          </ThemedText>
        )}
      </View>

      {entries.length === 0 ? (
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          Nenhum exercício registrado.
        </ThemedText>
      ) : (
        entries.map((entry) => (
          <View
            key={entry.id}
            style={[styles.row, { borderTopColor: colors.outlineVariant }]}>
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
        ))
      )}

      <Button
        label="Adicionar exercício"
        variant="tonal"
        icon={Plus}
        onPress={() => router.push({ pathname: '/log-exercise', params: { category, date } })}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
  },
});
