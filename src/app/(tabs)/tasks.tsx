import { router } from 'expo-router';
import ListChecks from 'lucide-react-native/icons/list-checks';
import Plus from 'lucide-react-native/icons/plus';
import Repeat from 'lucide-react-native/icons/repeat';
import { useState } from 'react';

import { DaySelector } from '@/components/exercise/day-selector';
import { ScreenTitle } from '@/components/screen-title';
import { TaskSection } from '@/components/tasks/task-section';
import { TabScreen } from '@/components/tab-screen';
import { Fab } from '@/components/ui/fab';
import { getMainTab } from '@/constants/tabs';
import { useTasks } from '@/context/tasks';
import { toDateKey } from '@/lib/exercises';
import { isTaskDue } from '@/lib/tasks';
import { useAppTheme } from '@/theme';

const tab = getMainTab('tasks');

export default function TasksScreen() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const { tasks } = useTasks();
  const { custom } = useAppTheme();

  const repeating = tasks.filter((task) => isTaskDue(task, date));
  // One-off tasks show every day until done, then only on the day they were done.
  const oneOff = tasks.filter(
    (task) =>
      task.repeat.kind === 'none' && (task.doneDates.length === 0 || task.doneDates[0] === date),
  );

  return (
    <TabScreen
      header={<ScreenTitle>{tab.label}</ScreenTitle>}
      fab={
        <Fab
          icon={Plus}
          label="Adicionar tarefa"
          onPress={() => router.push({ pathname: '/add-task', params: { date } })}
        />
      }>
      <DaySelector date={date} onChange={setDate} />

      <TaskSection
        title="Do dia"
        icon={Repeat}
        color={custom.steps.color}
        date={date}
        tasks={repeating}
        empty="Nenhuma tarefa repetida para este dia."
      />
      <TaskSection
        title="Sem repetição"
        icon={ListChecks}
        color={custom.fat.color}
        date={date}
        tasks={oneOff}
        empty="Nenhuma tarefa pendente."
      />

    </TabScreen>
  );
}

