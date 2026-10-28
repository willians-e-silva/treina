import { router } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import Circle from 'lucide-react-native/icons/circle';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Brand, Spacing } from '@/constants/theme';
import { useTasks } from '@/context/tasks';
import { useTheme } from '@/hooks/use-theme';
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
  const theme = useTheme();
  const { toggleTask, removeTask, toggleSubtask, removeSubtask } = useTasks();
  const done = tasks.filter((task) => isTaskDone(task, date)).length;

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <View style={styles.title}>
          <Icon color={color} size={20} aria-hidden />
          <ThemedText type="smallBold" accessibilityRole="header">
            {title}
          </ThemedText>
        </View>
        {tasks.length > 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            {done}/{tasks.length}
          </ThemedText>
        )}
      </View>

      {tasks.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
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
            <View key={task.id} style={[styles.task, { borderTopColor: theme.backgroundSelected }]}>
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
  const theme = useTheme();
  const iconSize = small ? 18 : 22;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={title}
        style={({ pressed }) => [styles.check, pressed && styles.pressed]}>
        {checked ? (
          <CircleCheck color={Brand.primary} size={iconSize} aria-hidden />
        ) : (
          <Circle color={theme.textSecondary} size={iconSize} aria-hidden />
        )}
        <View style={styles.rowText}>
          <ThemedText
            type={small ? 'small' : 'default'}
            numberOfLines={2}
            themeColor={checked ? 'textSecondary' : undefined}
            style={checked && styles.checked}>
            {title}
          </ThemedText>
          {!!details && (
            <ThemedText type="small" themeColor="textSecondary">
              {details}
            </ThemedText>
          )}
        </View>
      </Pressable>
      {onAddSubtask && (
        <Pressable
          onPress={onAddSubtask}
          accessibilityRole="button"
          accessibilityLabel={`Adicionar subtarefa em ${title}`}
          hitSlop={Spacing.two}
          style={({ pressed }) => pressed && styles.pressed}>
          <Plus color={theme.textSecondary} size={18} />
        </Pressable>
      )}
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remover ${title}`}
        hitSlop={Spacing.two}
        style={({ pressed }) => pressed && styles.pressed}>
        <Trash color={theme.textSecondary} size={small ? 16 : 18} />
      </Pressable>
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
    gap: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  subtasks: {
    gap: Spacing.two,
    // Lines the subtask checkboxes up under the task title.
    paddingLeft: 22 + Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  check: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowText: {
    flex: 1,
  },
  checked: {
    textDecorationLine: 'line-through',
  },
  pressed: {
    opacity: 0.5,
  },
});
