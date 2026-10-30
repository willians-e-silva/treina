import Dumbbell from 'lucide-react-native/icons/dumbbell';
import HeartPulse from 'lucide-react-native/icons/heart-pulse';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatInt } from '@/components/dashboard/format';
import { DaySelector } from '@/components/exercise/day-selector';
import { ExerciseSection } from '@/components/exercise/exercise-section';
import { ScreenTitle } from '@/components/screen-title';
import { TabScreen } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { getMainTab } from '@/constants/tabs';
import { Spacing } from '@/constants/theme';
import { useExerciseDay } from '@/context/exercise-log';
import { toDateKey } from '@/lib/exercises';
import { useAppTheme } from '@/theme';

const tab = getMainTab('exercise');

export default function ExerciseScreen() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const day = useExerciseDay(date);
  const { custom } = useAppTheme();

  return (
    <TabScreen header={<ScreenTitle>{tab.label}</ScreenTitle>}>
      <DaySelector date={date} onChange={setDate} />

      <Surface style={styles.totals}>
        <Total label="Calorias queimadas" value={`${formatInt(day.calories)} kcal`} />
        <Total label="Minutos" value={formatInt(day.minutes)} />
        <Total label="Exercícios" value={formatInt(day.cardio.length + day.strength.length)} />
      </Surface>

      <ExerciseSection
        category="cardio"
        icon={HeartPulse}
        color={custom.exercise.color}
        date={date}
        entries={day.cardio}
        summary={`${formatInt(day.calories)} kcal`}
      />
      <ExerciseSection
        category="strength"
        icon={Dumbbell}
        color={custom.protein.color}
        date={date}
        entries={day.strength}
      />
    </TabScreen>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.total}>
      <ThemedText type="titleLarge" emphasized>
        {value}
      </ThemedText>
      <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" style={styles.totalLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  totals: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  total: {
    flex: 1,
    alignItems: 'center',
  },
  totalLabel: {
    textAlign: 'center',
  },
});
