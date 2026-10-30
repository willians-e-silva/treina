import { router, Stack, useLocalSearchParams } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTasks } from '@/context/tasks';
import { useTheme } from '@/hooks/use-theme';
import { fromDateKey, toDateKey } from '@/lib/exercises';
import type { RepeatUnit, TaskRepeat } from '@/lib/tasks';

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
  const theme = useTheme();
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
          // Opaque: since SDK 58 the header is transparent on iOS 26+.
          headerTransparent: false,
          title: parent ? 'Nova subtarefa' : 'Nova tarefa',
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              hitSlop={Spacing.two}
              style={({ pressed }) => pressed && styles.pressed}>
              <ChevronLeft color={Brand.primary} size={24} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled">
        <TextInput
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={save}
          placeholder={parent ? 'Nome da subtarefa' : 'Nome da tarefa'}
          placeholderTextColor={theme.textSecondary}
          autoFocus
          returnKeyType="done"
          accessibilityLabel={parent ? 'Nome da subtarefa' : 'Nome da tarefa'}
          style={[styles.title, { color: theme.text, backgroundColor: theme.backgroundElement }]}
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
                    style={({ pressed }) => [
                      styles.option,
                      index > 0 && {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: theme.backgroundSelected,
                      },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText style={styles.optionLabel}>{item.label}</ThemedText>
                    <View
                      style={[
                        styles.radio,
                        { borderColor: option === item.value ? Brand.primary : theme.textSecondary },
                      ]}>
                      {option === item.value && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                ))}
              </Surface>
            </View>

            {option === 'custom' && (
              <Surface style={styles.custom}>
                <ThemedText style={styles.optionLabel}>A cada</ThemedText>
                <TextInput
                  value={interval}
                  onChangeText={setIntervalText}
                  keyboardType="number-pad"
                  selectTextOnFocus
                  accessibilityLabel="Intervalo"
                  style={[styles.interval, { color: theme.text, backgroundColor: theme.backgroundSelected }]}
                />
                <View style={[styles.segmented, { backgroundColor: theme.backgroundSelected }]}>
                  {UNIT_OPTIONS.map((item) => (
                    <Pressable
                      key={item.value}
                      onPress={() => setUnit(item.value)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: unit === item.value }}
                      style={[styles.segment, unit === item.value && styles.segmentSelected]}>
                      <ThemedText
                        type="titleSmall"
                        style={unit === item.value && { color: Brand.onPrimary }}>
                        {item.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
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
                        borderTopColor: theme.backgroundSelected,
                      },
                    ]}>
                    <ThemedText style={styles.optionLabel}>{subtask}</ThemedText>
                    <Pressable
                      onPress={() => setSubtasks((current) => current.filter((_, i) => i !== index))}
                      accessibilityRole="button"
                      accessibilityLabel={`Remover ${subtask}`}
                      hitSlop={Spacing.two}
                      style={({ pressed }) => pressed && styles.pressed}>
                      <Trash color={theme.textSecondary} size={18} />
                    </Pressable>
                  </View>
                ))}
                <View
                  style={[
                    styles.option,
                    subtasks.length > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: theme.backgroundSelected,
                    },
                  ]}>
                  <TextInput
                    value={subtaskDraft}
                    onChangeText={setSubtaskDraft}
                    onSubmitEditing={addDraftSubtask}
                    placeholder="Adicionar subtarefa"
                    placeholderTextColor={theme.textSecondary}
                    returnKeyType="next"
                    submitBehavior="submit"
                    accessibilityLabel="Nova subtarefa"
                    style={[styles.subtaskInput, { color: theme.text }]}
                  />
                  <Pressable
                    onPress={addDraftSubtask}
                    disabled={!subtaskDraft.trim()}
                    accessibilityRole="button"
                    accessibilityLabel="Adicionar subtarefa"
                    hitSlop={Spacing.two}
                    style={({ pressed }) => (pressed || !subtaskDraft.trim()) && styles.pressed}>
                    <Plus color={Brand.primary} size={20} strokeWidth={2.5} />
                  </Pressable>
                </View>
              </Surface>
            </View>
          </>
        )}

        <Pressable
          onPress={save}
          disabled={!valid}
          accessibilityRole="button"
          accessibilityState={{ disabled: !valid }}
          style={({ pressed }) => [styles.save, (!valid || pressed) && styles.pressed]}>
          <ThemedText style={styles.saveText}>Adicionar</ThemedText>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    height: 52,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
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
    paddingVertical: Spacing.three,
  },
  optionLabel: {
    flex: 1,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Brand.primary,
  },
  custom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  interval: {
    width: 64,
    height: 44,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    textAlign: 'center',
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    padding: Spacing.half,
  },
  segment: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two - Spacing.half,
  },
  segmentSelected: {
    backgroundColor: Brand.primary,
  },
  save: {
    height: 52,
    borderRadius: Spacing.three,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: Brand.onPrimary,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.5,
  },
});
