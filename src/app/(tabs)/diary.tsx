import { router } from 'expo-router';
import Pencil from 'lucide-react-native/icons/pencil';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatInt } from '@/components/dashboard/format';
import { MealSection } from '@/components/diary/meal-section';
import { DaySelector } from '@/components/exercise/day-selector';
import { ScreenTitle } from '@/components/screen-title';
import { TabScreen } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { getMainTab } from '@/constants/tabs';
import { Spacing } from '@/constants/theme';
import { useFoodDay } from '@/context/food-log';
import { toDateKey } from '@/lib/exercises';
import { useAppTheme } from '@/theme';

const tab = getMainTab('diary');

export default function DiaryScreen() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const { sections, totals } = useFoodDay(date);
  const { custom } = useAppTheme();

  return (
    <TabScreen header={<ScreenTitle>{tab.label}</ScreenTitle>}>
      <DaySelector date={date} onChange={setDate} />

      <Surface style={styles.totals}>
        <Total label="kcal" value={formatInt(totals.kcal)} />
        <Total label="Carboidratos" value={`${formatInt(totals.carbs)} g`} color={custom.carbs.color} />
        <Total label="Proteínas" value={`${formatInt(totals.protein)} g`} color={custom.protein.color} />
        <Total label="Gorduras" value={`${formatInt(totals.fat)} g`} color={custom.fat.color} />
      </Surface>

      {sections.map(({ meal, entries, removed }) => (
        <MealSection key={meal.id} meal={meal} date={date} entries={entries} removed={removed} />
      ))}

      <Button
        label="Editar refeições"
        variant="outlined"
        icon={Pencil}
        onPress={() => router.push('/meals')}
        style={styles.editMeals}
      />
    </TabScreen>
  );
}

function Total({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.total}>
      <ThemedText type="titleLarge" emphasized style={color ? { color } : undefined}>
        {value}
      </ThemedText>
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
  totalLabel: {
    textAlign: 'center',
  },
  editMeals: {
    alignSelf: 'center',
  },
});
