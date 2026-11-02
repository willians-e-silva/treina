import ListChecks from 'lucide-react-native/icons/list-checks';
import { StyleSheet, View } from 'react-native';

import { CardTitle } from './card-title';
import { ProgressBar } from './progress-bar';
import { ProgressRing } from './progress-ring';

import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useTasks } from '@/context/tasks';
import { getTasksForDay, isDoneOn, isTaskDone } from '@/lib/tasks';
import { Shape, useAppTheme } from '@/theme';

const RING = { size: 148, stroke: 10, gap: 4 };

/**
 * Today's tasks, the same ones the Tasks tab shows for today: three nested
 * rings with the share done of everything (outer), of tasks (middle) and of
 * subtasks (inner). The half-width version shows one bar per share instead.
 */
export function TasksCard({ date, compact }: { date: string; compact?: boolean }) {
  const { colors, custom } = useAppTheme();
  const { tasks } = useTasks();
  const { repeating, oneOff } = getTasksForDay(tasks, date);
  const today = [...repeating, ...oneOff];

  const tasksDone = today.filter((task) => isTaskDone(task, date)).length;
  const subtasks = today.flatMap((task) =>
    task.subtasks.map((subtask) => isDoneOn(subtask.doneDates, task.repeat, date)),
  );
  const subtasksDone = subtasks.filter(Boolean).length;

  // Outermost first.
  const series = [
    {
      label: 'Total',
      done: tasksDone + subtasksDone,
      total: today.length + subtasks.length,
      color: custom.diet.color,
    },
    { label: 'Tarefas', done: tasksDone, total: today.length, color: colors.tertiary },
    { label: 'Subtarefas', done: subtasksDone, total: subtasks.length, color: colors.secondary },
  ];

  if (compact) {
    // Same pattern as the compact macros card: one labeled bar per series.
    return (
      <Surface style={[styles.container, styles.compact]}>
        <CardTitle icon={ListChecks} color={colors.tertiary}>
          Tarefas
        </CardTitle>
        {series.map(({ label, done, total, color }) => (
          <View
            key={label}
            style={styles.bar}
            accessible
            accessibilityLabel={`${label}: ${percent(done, total)}% concluídas`}>
            <View style={styles.barLabel}>
              <ThemedText type="labelMedium" style={{ color }} numberOfLines={1}>
                {label}
              </ThemedText>
              <ThemedText type="labelMedium" themeColor="onSurfaceVariant">
                {percent(done, total)}%
              </ThemedText>
            </View>
            <ProgressBar progress={fraction(done, total)} color={color} />
          </View>
        ))}
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <CardTitle icon={ListChecks} color={colors.tertiary}>
        Tarefas
      </CardTitle>

      <View style={styles.content}>
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={series
            .map(({ label, done, total }) => `${label}: ${percent(done, total)}% concluídas`)
            .join(', ')}>
          <NestedRings series={series} {...RING} />
        </View>

        <View style={styles.legend} aria-hidden>
          {series.map(({ label, done, total, color }) => (
            <View key={label} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <View>
                <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
                  {label}
                </ThemedText>
                <ThemedText type="titleLarge" emphasized>
                  {percent(done, total)}%
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Surface>
  );
}

type Series = { label: string; done: number; total: number; color: string }[];

/** One ring per series, each inside the previous one. */
function NestedRings({
  series,
  size,
  stroke,
  gap,
}: { series: Series } & typeof RING) {
  const [first, ...rest] = series;
  if (!first) return null;
  return (
    <ProgressRing
      progress={fraction(first.done, first.total)}
      color={first.color}
      size={size}
      strokeWidth={stroke}>
      <NestedRings series={rest} size={size - 2 * (stroke + gap)} stroke={stroke} gap={gap} />
    </ProgressRing>
  );
}

function fraction(done: number, total: number) {
  return total > 0 ? done / total : 0;
}

function percent(done: number, total: number) {
  return Math.round(fraction(done, total) * 100);
}

const styles = StyleSheet.create({
  container: {
    // Fills its row when it sits next to a taller card.
    flexGrow: 1,
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: Spacing.three,
  },
  compact: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  bar: {
    gap: Spacing.one,
  },
  barLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  legend: {
    gap: Spacing.two,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: Shape.full,
  },
});
