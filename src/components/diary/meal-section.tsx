import { router } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatInt } from '@/components/dashboard/format';
import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Brand, Spacing } from '@/constants/theme';
import { useFoodLog } from '@/context/food-log';
import { useTheme } from '@/hooks/use-theme';
import { MEAL_LABELS, sumNutrients, type FoodEntry, type MealKey } from '@/lib/foods';

type MealSectionProps = {
  meal: MealKey;
  icon: LucideIcon;
  color: string;
  date: string;
  entries: FoodEntry[];
};

/** One diary meal with its foods, its total kcal and an add button. */
export function MealSection({ meal, icon: Icon, color, date, entries }: MealSectionProps) {
  const theme = useTheme();
  const { removeEntry } = useFoodLog();
  const total = sumNutrients(entries.map((entry) => entry.nutrients));

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <View style={styles.title}>
          <Icon color={color} size={20} aria-hidden />
          <ThemedText type="smallBold" accessibilityRole="header">
            {MEAL_LABELS[meal]}
          </ThemedText>
        </View>
        {entries.length > 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            {formatInt(total.kcal)} kcal
          </ThemedText>
        )}
      </View>

      {entries.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Nenhum alimento registrado.
        </ThemedText>
      ) : (
        entries.map((entry) => (
          <View
            key={entry.id}
            style={[styles.row, { borderTopColor: theme.backgroundSelected }]}>
            <View style={styles.rowText}>
              <ThemedText numberOfLines={1}>{entry.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {describeEntry(entry)}
              </ThemedText>
            </View>
            <ThemedText type="smallBold">{formatInt(entry.nutrients.kcal)} kcal</ThemedText>
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
        onPress={() => router.push({ pathname: '/log-food', params: { meal, date } })}
        accessibilityRole="button"
        accessibilityLabel={`Adicionar alimento ao ${MEAL_LABELS[meal]}`}
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
        <Plus color={Brand.primary} size={18} strokeWidth={2.5} aria-hidden />
        <ThemedText type="smallBold" style={styles.addText}>
          Adicionar alimento
        </ThemedText>
      </Pressable>
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
