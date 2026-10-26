import { router } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatDecimal, formatInt } from '@/components/dashboard/format';
import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Brand, Spacing } from '@/constants/theme';
import { useExerciseLog } from '@/context/exercise-log';
import { useTheme } from '@/hooks/use-theme';
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
  const theme = useTheme();
  const { removeEntry } = useExerciseLog();

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <View style={styles.title}>
          <Icon color={color} size={20} aria-hidden />
          <ThemedText type="smallBold" accessibilityRole="header">
            {CATEGORY_LABELS[category]}
          </ThemedText>
        </View>
        {summary && (
          <ThemedText type="small" themeColor="textSecondary">
            {summary}
          </ThemedText>
        )}
      </View>

      {entries.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Nenhum exercício registrado.
        </ThemedText>
      ) : (
        entries.map((entry) => (
          <View
            key={entry.id}
            style={[styles.row, { borderTopColor: theme.backgroundSelected }]}>
            <View style={styles.rowText}>
              <ThemedText numberOfLines={1}>{entry.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {describeEntry(entry)}
              </ThemedText>
            </View>
            {entry.category === 'cardio' && (
              <ThemedText type="smallBold">{formatInt(entry.calories)} kcal</ThemedText>
            )}
            <Pressable
              onPress={() => removeEntry(entry.id)}
              accessibilityRole="button"
              accessibilityLabel={`Remover ${entry.name}`}
              hitSlop={Spacing.two}
              style={({ pressed }) => pressed && styles.pressed}>
              <Trash color={theme.textSecondary} size={18} />
            </Pressable>
          </View>
        ))
      )}

      <Pressable
        onPress={() => router.push({ pathname: '/log-exercise', params: { category, date } })}
        accessibilityRole="button"
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
        <Plus color={Brand.primary} size={18} strokeWidth={2.5} aria-hidden />
        <ThemedText type="smallBold" style={styles.addText}>
          Adicionar exercício
        </ThemedText>
      </Pressable>
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
    gap: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
  },
  addText: {
    color: Brand.primary,
  },
  pressed: {
    opacity: 0.5,
  },
});
