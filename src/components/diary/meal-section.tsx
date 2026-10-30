import { router } from 'expo-router';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatInt } from '@/components/dashboard/format';
import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Brand, Spacing } from '@/constants/theme';
import { useFoodLog } from '@/context/food-log';
import { useTheme } from '@/hooks/use-theme';
import { sumNutrients, type FoodEntry, type Meal } from '@/lib/foods';

import { getMealIcon } from './meal-icons';

type MealSectionProps = {
  meal: Meal;
  date: string;
  entries: FoodEntry[];
  /** The meal was removed from the diary: its foods stay, but no new ones go in. */
  removed?: boolean;
};

/** One diary meal with its foods, its total kcal and an add button. */
export function MealSection({ meal, date, entries, removed }: MealSectionProps) {
  const theme = useTheme();
  const { removeEntry } = useFoodLog();
  const total = sumNutrients(entries.map((entry) => entry.nutrients));
  const { icon: Icon, color } = getMealIcon(meal.id);

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <View style={styles.title}>
          <Icon color={color} size={20} aria-hidden />
          <ThemedText type="titleSmall" accessibilityRole="header">
            {meal.name}
          </ThemedText>
        </View>
        {entries.length > 0 && (
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {formatInt(total.kcal)} kcal
          </ThemedText>
        )}
      </View>

      {entries.length === 0 ? (
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          Nenhum alimento registrado.
        </ThemedText>
      ) : (
        entries.map((entry) => (
          <View
            key={entry.id}
            style={[styles.row, { borderTopColor: theme.backgroundSelected }]}>
            <View style={styles.rowText}>
              <ThemedText numberOfLines={1}>{entry.name}</ThemedText>
              <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" numberOfLines={1}>
                {describeEntry(entry)}
              </ThemedText>
            </View>
            <ThemedText type="titleSmall">{formatInt(entry.nutrients.kcal)} kcal</ThemedText>
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

      {!removed && (
        <Pressable
          onPress={() => router.push({ pathname: '/log-food', params: { meal: meal.id, date } })}
          accessibilityRole="button"
          accessibilityLabel={`Adicionar alimento: ${meal.name}`}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <Plus color={Brand.primary} size={18} strokeWidth={2.5} aria-hidden />
          <ThemedText type="titleSmall" style={styles.addText}>
            Adicionar alimento
          </ThemedText>
        </Pressable>
      )}
    </Surface>
  );
}

function describeEntry(entry: FoodEntry) {
  return [`${formatInt(entry.grams)} g`, entry.detail].filter(Boolean).join(' · ');
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
