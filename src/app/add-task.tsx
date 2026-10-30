import { router, Stack, useLocalSearchParams } from 'expo-router';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/ui/header-back-button';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { SegmentedButtons } from '@/components/ui/segmented-buttons';
import { StateLayer } from '@/components/ui/state-layer';
import { Surface } from '@/components/ui/surface';
import { ThemedTextInput } from '@/components/ui/text-input';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTasks } from '@/context/tasks';
import { fromDateKey, toDateKey } from '@/lib/exercises';
import type { RepeatUnit, TaskRepeat } from '@/lib/tasks';
import { MinTouchTarget, Shape, useAppTheme } from '@/theme';

type RepeatOption = 'none' | 'daily' | 'weekly' | 'custom';

const REPEAT_OPTIONS: { value: RepeatOption; label: string }[] = [
  { value: 'none', label: 'Não repete' },
  { value: 'daily', label: 'Todo dia' },
  { value: 'weekly', label: 'Toda semana' },
  { value: 'custom', label: 'Personalizado' },
];

const UNIT_OPTIONS: { value: RepeatUnit; label: string }[] = [
  { value: 'day', label: 'Dias' },
  { value: 'week', label: 'Semanas' },
];

const longDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

export default function AddTaskScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { tasks, addTask, addSubtask } = useTasks();
  const params = useLocalSearchParams<{ date?: string; parentId?: string }>();
  const startDate = params.date ?? toDateKey(new Date());
  // With `parentId` the screen adds a subtask to that task instead.
  const parent = params.parentId ? tasks.find((task) => task.id === params.parentId) : undefined;

  const [title, setTitle] = useState('');
  const [option, setOption] = useState<RepeatOption>('none');
  const [interval, setIntervalText] = useState('2');
  const [unit, setUnit] = useState<RepeatUnit>('day');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState('');

  const intervalValue = Number(interval);
  const repeat: TaskRepeat | null =
    option === 'none'
      ? { kind: 'none' }
      : option === 'daily'
        ? { kind: 'every', interval: 1, unit: 'day' }
        : option === 'weekly'
          ? { kind: 'every', interval: 1, unit: 'week' }
          : Number.isInteger(intervalValue) && intervalValue > 0
            ? { kind: 'every', interval: intervalValue, unit }
            : null;
  const valid = title.trim().length > 0 && (!!parent || repeat !== null);

  function addDraftSubtask() {
    const draft = subtaskDraft.trim();
    if (!draft) return;
    setSubtasks((current) => [...current, draft]);
    setSubtaskDraft('');
  }

  function save() {
    if (!valid) return;
    if (parent) {
      addSubtask(parent.id, title.trim(), startDate);
    } else if (repeat) {
      // A subtask typed but not added yet is kept too.
      const draft = subtaskDraft.trim();
      addTask({
        title: title.trim(),
        repeat,
        startDate,
        subtasks: draft ? [...subtasks, draft] : subtasks,
      });
    }
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: parent ? 'Nova subtarefa' : 'Nova tarefa',
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled">
        <ThemedTextInput
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={save}
          placeholder={parent ? 'Nome da subtarefa' : 'Nome da tarefa'}
          autoFocus
          returnKeyType="done"
          accessibilityLabel={parent ? 'Nome da subtarefa' : 'Nome da tarefa'}
        />

        {parent ? (
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            Em “{parent.title}”. A tarefa fica concluída quando todas as subtarefas estiverem.
          </ThemedText>
        ) : (
          <>
            <View style={styles.group}>
              <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
                Repetição
              </ThemedText>
              <Surface style={styles.options} accessibilityRole="radiogroup">
                {REPEAT_OPTIONS.map((item, index) => (
                  <Pressable
                    key={item.value}
                    onPress={() => setOption(item.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: option === item.value }}
                    style={[
                      styles.option,
                      index > 0 && {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: colors.outlineVariant,
                      },
                    ]}>
                    {({ pressed }) => (
                      <>
                        <StateLayer color={colors.onSurface} pressed={pressed} />
                        <ThemedText style={styles.optionLabel}>{item.label}</ThemedText>
                        {/* `secondary`: primary is kept for the screen's main button. */}
                        <View
                          style={[
                            styles.radio,
                            {
                              borderColor:
                                option === item.value ? colors.secondary : colors.onSurfaceVariant,
                            },
                          ]}>
                          {option === item.value && (
                            <View style={[styles.radioDot, { backgroundColor: colors.secondary }]} />
                          )}
                        </View>
                      </>
                    )}
                  </Pressable>
                ))}
              </Surface>
            </View>

            {option === 'custom' && (
              <Surface style={styles.custom}>
                <ThemedText style={styles.optionLabel}>A cada</ThemedText>
                <ThemedTextInput
                  size="compact"
                  value={interval}
                  onChangeText={setIntervalText}
                  keyboardType="number-pad"
                  selectTextOnFocus
                  accessibilityLabel="Intervalo"
                  style={styles.interval}
                />
                <SegmentedButtons
                  options={UNIT_OPTIONS}
                  value={unit}
                  onChange={setUnit}
                  style={styles.segmented}
                />
              </Surface>
            )}

            {option !== 'none' && (
              <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
                Começa em {longDate.format(fromDateKey(startDate))}.
              </ThemedText>
            )}

            <View style={styles.group}>
              <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
                Subtarefas
              </ThemedText>
              <Surface style={styles.options}>
                {subtasks.map((subtask, index) => (
                  <View
                    key={index}
                    style={[
                      styles.option,
                      index > 0 && {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: colors.outlineVariant,
                      },
                    ]}>
                    <ThemedText style={styles.optionLabel}>{subtask}</ThemedText>
                    <IconButton
                      icon={Trash}
                      onPress={() => setSubtasks((current) => current.filter((_, i) => i !== index))}
                      accessibilityLabel={`Remover ${subtask}`}
                    />
                  </View>
                ))}
                <View
                  style={[
                    styles.option,
                    subtasks.length > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: colors.outlineVariant,
                    },
                  ]}>
                  <ThemedTextInput
                    size="compact"
                    value={subtaskDraft}
                    onChangeText={setSubtaskDraft}
                    onSubmitEditing={addDraftSubtask}
                    placeholder="Adicionar subtarefa"
                    returnKeyType="next"
                    submitBehavior="submit"
                    accessibilityLabel="Nova subtarefa"
                    style={styles.subtaskInput}
                  />
                  <IconButton
                    icon={Plus}
                    onPress={addDraftSubtask}
                    disabled={!subtaskDraft.trim()}
                    accessibilityLabel="Adicionar subtarefa"
                  />
                </View>
              </Surface>
            </View>
          </>
        )}

        <Button label="Adicionar" size="medium" fullWidth onPress={save} disabled={!valid} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.four,
  },
  group: {
    gap: Spacing.two,
  },
  options: {
    paddingVertical: Spacing.one,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: MinTouchTarget + Spacing.two,
    marginHorizontal: -Spacing.three,
    paddingHorizontal: Spacing.three,
    overflow: 'hidden',
  },
  optionLabel: {
    flex: 1,
  },
  subtaskInput: {
    flex: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: Shape.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: Shape.full,
  },
  custom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  interval: {
    width: 64,
    textAlign: 'center',
  },
  segmented: {
    flex: 1,
  },
});
