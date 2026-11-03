import { router } from 'expo-router';
import ArrowDown from 'lucide-react-native/icons/arrow-down';
import ArrowUp from 'lucide-react-native/icons/arrow-up';
import Check from 'lucide-react-native/icons/check';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { TrainerAvatar } from '@/components/trainers/trainer-avatar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Dialog } from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import { ListRow } from '@/components/ui/list-row';
import { SegmentedButtons } from '@/components/ui/segmented-buttons';
import { StateLayer } from '@/components/ui/state-layer';
import { Surface } from '@/components/ui/surface';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useCatalog } from '@/context/catalog';
import { useWorkoutPlan } from '@/context/workout-plan';
import {
  PLAN_MODE_LABELS,
  WEEKDAY_LABELS,
  WEEKDAYS,
  type PlanMode,
  type Weekday,
} from '@/lib/workouts';
import { MinTouchTarget, Shape, useAppTheme } from '@/theme';

const MODES: { value: PlanMode; label: string }[] = [
  { value: 'weekly', label: PLAN_MODE_LABELS.weekly },
  { value: 'queue', label: PLAN_MODE_LABELS.queue },
];

/** Workouts and how they are scheduled: by day of the week or as a queue. */
export default function WorkoutPlanScreen() {
  const insets = useSafeAreaInsets();
  const { workouts, plan, addWorkout, setMode } = useWorkoutPlan();
  const { getTrainer } = useCatalog();

  function createWorkout() {
    // "Treino A", "Treino B", …: the first letter not taken yet.
    const taken = new Set(workouts.map((workout) => workout.name));
    const letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find((l) => !taken.has(`Treino ${l}`));
    const id = addWorkout(letter ? `Treino ${letter}` : `Treino ${workouts.length + 1}`);
    router.push({ pathname: '/workouts/[id]', params: { id } });
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}>
      <View style={styles.group}>
        <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
          Treinos
        </ThemedText>
        {workouts.length === 0 ? (
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            Crie treinos com os exercícios de cada sessão, por exemplo “Treino A – Peito”.
          </ThemedText>
        ) : (
          <View>
            {workouts.map((workout, index) => {
              const trainer = workout.source && getTrainer(workout.source.trainerId);
              const count =
                workout.exercises.length === 1
                  ? '1 exercício'
                  : `${workout.exercises.length} exercícios`;
              return (
                <ListRow
                  key={workout.id}
                  title={workout.name}
                  supporting={trainer ? `${count} · ${trainer.name}` : count}
                  leading={
                    trainer && (
                      <TrainerAvatar name={trainer.name} photoUrl={trainer.photoUrl} size={32} />
                    )
                  }
                  first={index === 0}
                  last={index === workouts.length - 1}
                  onPress={() =>
                    router.push({ pathname: '/workouts/[id]', params: { id: workout.id } })
                  }
                />
              );
            })}
          </View>
        )}
        <Button label="Novo treino" variant="tonal" icon={Plus} onPress={createWorkout} />
      </View>

      <View style={styles.group}>
        <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
          Como os treinos se repetem
        </ThemedText>
        <SegmentedButtons options={MODES} value={plan.mode} onChange={setMode} />
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          {plan.mode === 'weekly'
            ? 'Cada dia da semana tem seu treino. Dias sem treino são de descanso.'
            : 'Os treinos seguem em ordem, em qualquer dia. Ao concluir um, o próximo da fila vira o treino do dia; no fim, a fila recomeça.'}
        </ThemedText>
        {plan.mode === 'weekly' ? <WeeklyPlan /> : <QueuePlan />}
      </View>

      <Button
        label="Confirmar"
        icon={Check}
        fullWidth
        // The plan is saved as it changes: this only goes back to the Exercícios tab.
        onPress={() => router.dismissTo('/exercise')}
      />
    </ScrollView>
  );
}

/** One row per day of the week, each opening a dialog to pick its workout. */
function WeeklyPlan() {
  const { colors } = useAppTheme();
  const { workouts, plan, setWeekday } = useWorkoutPlan();
  const [editing, setEditing] = useState<Weekday | null>(null);
  const nameOf = (id: string | undefined) => workouts.find((workout) => workout.id === id)?.name;

  return (
    <Surface style={styles.list}>
      {WEEKDAYS.map((day, index) => {
        const name = nameOf(plan.weekly[day]);
        return (
          <Pressable
            key={day}
            onPress={() => setEditing(day)}
            disabled={workouts.length === 0}
            accessibilityRole="button"
            accessibilityLabel={`${WEEKDAY_LABELS[day]}: ${name ?? 'descanso'}`}
            style={[
              styles.dayRow,
              index > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.outlineVariant,
              },
            ]}>
            {({ pressed }) => (
              <>
                <StateLayer color={colors.onSurface} pressed={pressed} />
                <ThemedText style={styles.dayName}>{WEEKDAY_LABELS[day]}</ThemedText>
                <ThemedText themeColor={name ? 'onSurface' : 'onSurfaceVariant'} numberOfLines={1}>
                  {name ?? 'Descanso'}
                </ThemedText>
                <ChevronDown color={colors.onSurfaceVariant} size={20} aria-hidden />
              </>
            )}
          </Pressable>
        );
      })}

      <Dialog
        visible={editing !== null}
        title={editing !== null ? WEEKDAY_LABELS[editing] : ''}
        onDismiss={() => setEditing(null)}
        actions={<Button label="Cancelar" variant="text" onPress={() => setEditing(null)} />}>
        <View>
          {[{ id: undefined, name: 'Descanso' }, ...workouts].map((option) => {
            const selected = editing !== null && plan.weekly[editing] === option.id;
            return (
              <Pressable
                key={option.id ?? 'rest'}
                onPress={() => {
                  if (editing !== null) setWeekday(editing, option.id);
                  setEditing(null);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                style={[styles.option, selected && { backgroundColor: colors.secondaryContainer }]}>
                {({ pressed }) => (
                  <>
                    <StateLayer color={colors.onSurface} pressed={pressed} />
                    <ThemedText
                      themeColor={selected ? 'onSecondaryContainer' : 'onSurface'}
                      style={styles.optionLabel}>
                      {option.name}
                    </ThemedText>
                    {selected && (
                      <Check color={colors.onSecondaryContainer} size={24} aria-hidden />
                    )}
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      </Dialog>
    </Surface>
  );
}

/** The queue in order, with the next workout marked; workouts are added below. */
function QueuePlan() {
  const { colors } = useAppTheme();
  const { workouts, plan, addToQueue, removeFromQueue, moveInQueue, setNextInQueue } =
    useWorkoutPlan();
  const nameOf = (id: string) => workouts.find((workout) => workout.id === id)?.name ?? '';

  return (
    <>
      {plan.queue.length > 0 && (
        <Surface style={styles.list}>
          {plan.queue.map((workoutId, index) => {
            const next = index === plan.queueIndex;
            return (
              <View
                key={`${workoutId}-${index}`}
                style={[
                  styles.queueRow,
                  index > 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: colors.outlineVariant,
                  },
                ]}>
                <Pressable
                  onPress={() => setNextInQueue(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`${index + 1}. ${nameOf(workoutId)}${next ? ', próximo treino' : ''}`}
                  accessibilityHint="Toque para tornar este o próximo treino."
                  style={styles.queueName}>
                  {({ pressed }) => (
                    <>
                      <StateLayer color={colors.onSurface} pressed={pressed} />
                      <ThemedText type="labelLarge" themeColor="onSurfaceVariant">
                        {index + 1}
                      </ThemedText>
                      <View style={styles.flex}>
                        <ThemedText numberOfLines={1}>{nameOf(workoutId)}</ThemedText>
                        {next && (
                          <ThemedText type="labelMedium" themeColor="secondary">
                            Próximo
                          </ThemedText>
                        )}
                      </View>
                    </>
                  )}
                </Pressable>
                <IconButton
                  icon={ArrowUp}
                  disabled={index === 0}
                  onPress={() => moveInQueue(index, -1)}
                  accessibilityLabel={`Mover ${nameOf(workoutId)} para cima`}
                />
                <IconButton
                  icon={ArrowDown}
                  disabled={index === plan.queue.length - 1}
                  onPress={() => moveInQueue(index, 1)}
                  accessibilityLabel={`Mover ${nameOf(workoutId)} para baixo`}
                />
                <IconButton
                  icon={Trash}
                  onPress={() => removeFromQueue(index)}
                  accessibilityLabel={`Remover ${nameOf(workoutId)} da fila`}
                />
              </View>
            );
          })}
        </Surface>
      )}

      {workouts.length > 0 ? (
        <View style={styles.chips}>
          {workouts.map((workout) => (
            <Chip
              key={workout.id}
              label={workout.name}
              icon={Plus}
              onPress={() => addToQueue(workout.id)}
              accessibilityLabel={`Adicionar ${workout.name} à fila`}
            />
          ))}
        </View>
      ) : (
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          Crie um treino para montar a fila.
        </ThemedText>
      )}
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
    gap: Spacing.five,
  },
  group: {
    gap: Spacing.three,
  },
  list: {
    paddingVertical: Spacing.one,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: MinTouchTarget + Spacing.two,
    marginHorizontal: -Spacing.three,
    paddingHorizontal: Spacing.three,
    overflow: 'hidden',
  },
  dayName: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MinTouchTarget,
    paddingHorizontal: Spacing.three,
    borderRadius: Shape.full,
    overflow: 'hidden',
  },
  optionLabel: {
    flex: 1,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueName: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: MinTouchTarget + Spacing.two,
    borderRadius: Shape.medium,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
