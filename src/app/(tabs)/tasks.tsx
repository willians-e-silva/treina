import { router } from 'expo-router';
import ListChecks from 'lucide-react-native/icons/list-checks';
import Plus from 'lucide-react-native/icons/plus';
import Repeat from 'lucide-react-native/icons/repeat';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { DaySelector } from '@/components/exercise/day-selector';
import { ScreenTitle } from '@/components/screen-title';
import { TaskSection } from '@/components/tasks/task-section';
import { TabScreen } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { getMainTab } from '@/constants/tabs';
import { Brand, Nutrition, Spacing } from '@/constants/theme';
import { useTasks } from '@/context/tasks';
import { toDateKey } from '@/lib/exercises';
import { isTaskDue } from '@/lib/tasks';

const tab = getMainTab('tasks');

export default function TasksScreen() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const { tasks } = useTasks();

  const repeating = tasks.filter((task) => isTaskDue(task, date));
  // One-off tasks show every day until done, then only on the day they were done.
  const oneOff = tasks.filter(
    (task) =>
      task.repeat.kind === 'none' && (task.doneDates.length === 0 || task.doneDates[0] === date),
  );

  return (
    <TabScreen header={<ScreenTitle>{tab.label}</ScreenTitle>}>
      <DaySelector date={date} onChange={setDate} />

      <TaskSection
        title="Do dia"
        icon={Repeat}
        color={Nutrition.steps}
        date={date}
        tasks={repeating}
        empty="Nenhuma tarefa repetida para este dia."
      />
      <TaskSection
        title="Sem repetição"
        icon={ListChecks}
        color={Brand.primary}
        date={date}
        tasks={oneOff}
        empty="Nenhuma tarefa pendente."
      />

      <Pressable
        onPress={() => router.push({ pathname: '/add-task', params: { date } })}
        accessibilityRole="button"
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
        <Plus color={Brand.onPrimary} size={18} strokeWidth={2.5} aria-hidden />
        <ThemedText style={styles.addText}>Adicionar tarefa</ThemedText>
      </Pressable>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  addButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    backgroundColor: Brand.primary,
  },
  addText: {
    color: Brand.onPrimary,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.5,
  },
});
