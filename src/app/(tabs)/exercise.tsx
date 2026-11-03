import { router } from 'expo-router';
import Plus from 'lucide-react-native/icons/plus';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatInt } from '@/components/dashboard/format';
import { DaySelector } from '@/components/exercise/day-selector';
import { ExerciseList } from '@/components/exercise/exercise-list';
import { WorkoutCard } from '@/components/exercise/workout-card';
import { TabScreen } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { Fab } from '@/components/ui/fab';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useExerciseDay } from '@/context/exercise-log';
import { toDateKey } from '@/lib/exercises';

export default function ExerciseScreen() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const day = useExerciseDay(date);

  return (
    <TabScreen
      fab={
        <Fab
          icon={Plus}
          accessibilityLabel="Adicionar exercício"
          onPress={() => router.push({ pathname: '/log-exercise', params: { date } })}
        />
      }>
      <DaySelector date={date} onChange={setDate} />

      <Surface style={styles.totals}>
        <Total label="Calorias queimadas" value={`${formatInt(day.calories)} kcal`} />
        <Total label="Minutos" value={formatInt(day.minutes)} />
        <Total label="Exercícios" value={formatInt(day.entries.length)} />
      </Surface>

      <WorkoutCard date={date} />

      <ExerciseList entries={day.entries} />
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
