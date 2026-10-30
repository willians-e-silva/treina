import { router } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import Circle from 'lucide-react-native/icons/circle';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { StateLayer } from '@/components/ui/state-layer';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useTasks } from '@/context/tasks';
import { MinTouchTarget, Shape, useAppTheme } from '@/theme';
import { describeRepeat, isDoneOn, isTaskDone, type Task } from '@/lib/tasks';

type TaskSectionProps = {
  title: string;
  icon: LucideIcon;
  color: string;
  /** Day the checkboxes refer to. */
  date: string;
  tasks: Task[];
  empty: string;
};

/** Panel with a checklist of tasks, like the exercise diary sections. */
export function TaskSection({ title, icon: Icon, color, date, tasks, empty }: TaskSectionProps) {
  const { colors } = useAppTheme();
  const { toggleTask, removeTask, toggleSubtask, removeSubtask } = useTasks();
  const done = tasks.filter((task) => isTaskDone(task, date)).length;

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <View style={styles.title}>
          <Icon color={color} size={20} aria-hidden />
          <ThemedText type="titleSmall" accessibilityRole="header">
            {title}
          </ThemedText>
        </View>
        {tasks.length > 0 && (
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {done}/{tasks.length}
          </ThemedText>
        )}
      </View>

      {tasks.length === 0 ? (
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          {empty}
        </ThemedText>
      ) : (
        tasks.map((task) => {
          const subtasksDone = task.subtasks.filter((subtask) =>
            isDoneOn(subtask.doneDates, task.repeat, date),
          ).length;
          const details = [
            task.repeat.kind === 'every' ? describeRepeat(task.repeat) : undefined,
            task.subtasks.length > 0 ? `${subtasksDone}/${task.subtasks.length} subtarefas` : undefined,
          ].filter(Boolean);

          return (
            <View key={task.id} style={[styles.task, { borderTopColor: colors.outlineVariant }]}>
              <CheckRow
                title={task.title}
                details={details.join(' · ')}
                checked={isTaskDone(task, date)}
                onToggle={() => toggleTask(task.id, date)}
                onRemove={() => removeTask(task.id)}
                onAddSubtask={() =>
                  router.push({ pathname: '/add-task', params: { date, parentId: task.id } })
                }
              />
              {task.subtasks.length > 0 && (
                <View style={styles.subtasks}>
                  {task.subtasks.map((subtask) => (
                    <CheckRow
                      key={subtask.id}
                      title={subtask.title}
                      checked={isDoneOn(subtask.doneDates, task.repeat, date)}
                      onToggle={() => toggleSubtask(task.id, subtask.id, date)}
                      onRemove={() => removeSubtask(task.id, subtask.id, date)}
                      small
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })
      )}
    </Surface>
  );
}

type CheckRowProps = {
  title: string;
  details?: string;
  checked: boolean;
  onToggle: () => void;
  onRemove: () => void;
  /** Shows a "+" button; only tasks take subtasks. */
  onAddSubtask?: () => void;
  /** Subtask look: smaller checkbox and text. */
  small?: boolean;
};

function CheckRow({ title, details, checked, onToggle, onRemove, onAddSubtask, small }: CheckRowProps) {
  const { colors } = useAppTheme();
  const iconSize = small ? 20 : 24;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={title}
        style={styles.check}>
        {({ pressed }) => (
          <>
            <StateLayer color={colors.onSurface} pressed={pressed} />
            {/* `secondary`: primary is kept for each screen's main action. */}
            {checked ? (
              <CircleCheck color={colors.secondary} size={iconSize} aria-hidden />
            ) : (
              <Circle color={colors.onSurfaceVariant} size={iconSize} aria-hidden />
            )}
            <View style={styles.rowText}>
              <ThemedText
                type={small ? 'bodyMedium' : 'bodyLarge'}
                numberOfLines={2}
                themeColor={checked ? 'onSurfaceVariant' : 'onSurface'}
                style={checked && styles.checked}>
                {title}
              </ThemedText>
              {!!details && (
                <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
                  {details}
                </ThemedText>
              )}
            </View>
          </>
        )}
      </Pressable>
      {onAddSubtask && (
        <IconButton
          icon={Plus}
          onPress={onAddSubtask}
          accessibilityLabel={`Adicionar subtarefa em ${title}`}
        />
      )}
      <IconButton
        icon={Trash}
        size={small ? 20 : 24}
        onPress={onRemove}
        accessibilityLabel={`Remover ${title}`}
      />
    </View>
  );
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
  task: {
    gap: Spacing.one,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  subtasks: {
    gap: Spacing.two,
    // Lines the subtask checkboxes up under the task title.
    paddingLeft: 24 + Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  check: {
    flex: 1,
    minHeight: MinTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Shape.medium,
    overflow: 'hidden',
  },
  rowText: {
    flex: 1,
  },
  checked: {
    textDecorationLine: 'line-through',
  },
});
