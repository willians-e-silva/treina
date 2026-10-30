import type { LucideIcon } from 'lucide-react-native';
import Coffee from 'lucide-react-native/icons/coffee';
import Cookie from 'lucide-react-native/icons/cookie';
import Moon from 'lucide-react-native/icons/moon';
import Soup from 'lucide-react-native/icons/soup';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatInt } from '@/components/dashboard/format';
import { MealSection } from '@/components/diary/meal-section';
import { DaySelector } from '@/components/exercise/day-selector';
import { ScreenTitle } from '@/components/screen-title';
import { TabScreen } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { getMainTab } from '@/constants/tabs';
import { Nutrition, Spacing } from '@/constants/theme';
import { useFoodDay } from '@/context/food-log';
import { toDateKey } from '@/lib/exercises';
import { MEALS, type MealKey } from '@/lib/foods';

const tab = getMainTab('diary');

const MEAL_ICONS: Record<MealKey, { icon: LucideIcon; color: string }> = {
  breakfast: { icon: Coffee, color: Nutrition.calories },
  lunch: { icon: Soup, color: Nutrition.protein },
  snack: { icon: Cookie, color: Nutrition.carbs },
  dinner: { icon: Moon, color: Nutrition.fat },
};

export default function DiaryScreen() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const { meals, totals } = useFoodDay(date);

  return (
    <TabScreen header={<ScreenTitle>{tab.label}</ScreenTitle>}>
      <DaySelector date={date} onChange={setDate} />

      <Surface style={styles.totals}>
        <Total label="kcal" value={formatInt(totals.kcal)} />
        <Total label="Carboidratos" value={`${formatInt(totals.carbs)} g`} color={Nutrition.carbs} />
        <Total label="Proteínas" value={`${formatInt(totals.protein)} g`} color={Nutrition.protein} />
        <Total label="Gorduras" value={`${formatInt(totals.fat)} g`} color={Nutrition.fat} />
      </Surface>

      {MEALS.map((meal) => (
        <MealSection
          key={meal}
          meal={meal}
          icon={MEAL_ICONS[meal].icon}
          color={MEAL_ICONS[meal].color}
          date={date}
          entries={meals[meal]}
        />
      ))}
    </TabScreen>
  );
}

function Total({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.total}>
      <ThemedText style={[styles.totalValue, color ? { color } : undefined]}>{value}</ThemedText>
      {/* Four columns are narrow on small phones: shrink rather than wrap. */}
      <ThemedText
        type="small"
        themeColor="textSecondary"
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
});
