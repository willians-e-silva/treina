import { router } from 'expo-router';
import Pencil from 'lucide-react-native/icons/pencil';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatInt } from '@/components/dashboard/format';
import { MealSection } from '@/components/diary/meal-section';
import { DaySelector } from '@/components/exercise/day-selector';
import { ScreenTitle } from '@/components/screen-title';
import { TabScreen } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { getMainTab } from '@/constants/tabs';
import { Brand, Nutrition, Spacing } from '@/constants/theme';
import { useFoodDay } from '@/context/food-log';
import { toDateKey } from '@/lib/exercises';

const tab = getMainTab('diary');

export default function DiaryScreen() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const { sections, totals } = useFoodDay(date);

  return (
    <TabScreen header={<ScreenTitle>{tab.label}</ScreenTitle>}>
      <DaySelector date={date} onChange={setDate} />

      <Surface style={styles.totals}>
        <Total label="kcal" value={formatInt(totals.kcal)} />
        <Total label="Carboidratos" value={`${formatInt(totals.carbs)} g`} color={Nutrition.carbs} />
        <Total label="Proteínas" value={`${formatInt(totals.protein)} g`} color={Nutrition.protein} />
        <Total label="Gorduras" value={`${formatInt(totals.fat)} g`} color={Nutrition.fat} />
      </Surface>

      {sections.map(({ meal, entries, removed }) => (
        <MealSection key={meal.id} meal={meal} date={date} entries={entries} removed={removed} />
      ))}

      <Pressable
        onPress={() => router.push('/meals')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.editMeals, pressed && styles.pressed]}>
        <Pencil color={Brand.primary} size={18} strokeWidth={2.5} aria-hidden />
        <ThemedText type="titleSmall" style={styles.editMealsText}>
          Editar refeições
        </ThemedText>
      </Pressable>
    </TabScreen>
  );
}

function Total({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.total}>
      <ThemedText style={[styles.totalValue, color ? { color } : undefined]}>{value}</ThemedText>
      {/* Four columns are narrow on small phones: shrink rather than wrap. */}
      <ThemedText
        type="bodyMedium"
        themeColor="onSurfaceVariant"
        numberOfLines={1}
        adjustsFontSizeToFit
        style={styles.totalLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  totals: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.three,
  },
  total: {
    flex: 1,
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: 700,
  },
  totalLabel: {
    textAlign: 'center',
  },
  editMeals: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  editMealsText: {
    color: Brand.primary,
  },
  pressed: {
    opacity: 0.5,
  },
});
