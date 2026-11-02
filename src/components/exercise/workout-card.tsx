import { router } from 'expo-router';
import Check from 'lucide-react-native/icons/check';
import Play from 'lucide-react-native/icons/play';
import Circle from 'lucide-react-native/icons/circle';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import ClipboardList from 'lucide-react-native/icons/clipboard-list';
import Settings from 'lucide-react-native/icons/settings-2';
import { Pressable, StyleSheet, View } from 'react-native';

import { CardTitle } from '@/components/dashboard/card-title';
import { ThemedText } from '@/components/themed-text';
import { WorkoutSourceRow } from '@/components/trainers/workout-source';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { StateLayer } from '@/components/ui/state-layer';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useExerciseLog } from '@/context/exercise-log';
import { useSession } from '@/context/session';
import { useWorkoutPlan } from '@/context/workout-plan';
import { estimateCalories, fromDateKey, toDateKey, type ExerciseEntry } from '@/lib/exercises';
import { MOCK_PROFILE } from '@/lib/profile';
import {
  describePlanned,
  FEELING_LABELS,
  formatDuration,
  getWorkoutForDate,
  WEEKDAY_LABELS,
  type PlannedExercise,
  type Weekday,
} from '@/lib/workouts';
import { MinTouchTarget, Shape, useAppTheme } from '@/theme';

/**
 * The day's workout from the plan: its exercises, checked once logged in the
 * diary, and the button that marks the workout done (moving the queue on).
 */
export function WorkoutCard({ date }: { date: string }) {
  const { colors } = useAppTheme();
  const { workouts, plan, completions, completeWorkout, undoCompletion } = useWorkoutPlan();
  const session = completions.find((completion) => completion.date === date)?.session;
  const { entries, addEntry, removeEntry } = useExerciseLog();
  const bodyWeightKg = useSession().profile?.weightKg ?? MOCK_PROFILE.weightKg;
  const today = toDateKey(new Date());
  const current = getWorkoutForDate(plan, workouts, completions, date, today);
  // Future days only preview the workout: nothing can be logged yet.
  const canLog = date <= today;

  const loggedEntry = (exercise: PlannedExercise) =>
    entries.find((entry) => entry.date === date && entry.plannedId === exercise.id);

  function logExercise(exercise: PlannedExercise) {
    const base = { date, name: exercise.name, plannedId: exercise.id };
    if (exercise.category === 'cardio') {
      addEntry({
        ...base,
        category: 'cardio',
        minutes: exercise.minutes,
        calories: exercise.met ? estimateCalories(exercise.met, bodyWeightKg, exercise.minutes) : 0,
      });
    } else {
      addEntry({
        ...base,
        category: 'strength',
        sets: exercise.sets,
        reps: exercise.reps,
        weightKg: exercise.weightKg,
      });
    }
  }

  function toggle(exercise: PlannedExercise, entry: ExerciseEntry | undefined) {
    if (entry) removeEntry(entry.id);
    else logExercise(exercise);
  }

  function complete() {
    if (!current) return;
    // Exercises not checked yet go into the diary as planned.
    for (const exercise of current.workout.exercises) {
      if (!loggedEntry(exercise)) logExercise(exercise);
    }
    completeWorkout(date, current.workout.id);
  }

  const subtitle = !current
    ? undefined
    : current.done
      ? session
        ? `Concluído · ${formatDuration(session.durationSeconds)} · Sensação ${session.feeling}/5 (${FEELING_LABELS[session.feeling]})`
        : 'Concluído'
      : plan.mode === 'weekly'
        ? WEEKDAY_LABELS[fromDateKey(date).getDay() as Weekday]
        : 'Próximo da fila';

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <CardTitle icon={ClipboardList} color={colors.tertiary}>
          Treino do dia
        </CardTitle>
        <IconButton
          icon={Settings}
          onPress={() => router.push('/workouts')}
          accessibilityLabel="Planejar treinos"
        />
      </View>

      {workouts.length === 0 ? (
        <>
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            Monte seus treinos e escolha se eles seguem os dias da semana ou uma fila.
          </ThemedText>
          <Button
            label="Planejar treinos"
            variant="tonal"
            icon={ClipboardList}
            onPress={() => router.push('/workouts')}
          />
        </>
      ) : !current ? (
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          {plan.mode === 'weekly' ? 'Dia de descanso.' : 'Nenhum treino neste dia.'}
        </ThemedText>
      ) : (
        <>
          <View>
            <ThemedText type="titleMedium" emphasized>
              {current.workout.name}
            </ThemedText>
            <ThemedText type="bodyMedium" themeColor={current.done ? 'secondary' : 'onSurfaceVariant'}>
              {subtitle}
            </ThemedText>
          </View>

          {!!current.workout.summary && (
            <ThemedText type="bodyMedium">{current.workout.summary}</ThemedText>
          )}

          {current.workout.source && <WorkoutSourceRow source={current.workout.source} />}

          {current.workout.exercises.length === 0 ? (
            <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
              Este treino ainda não tem exercícios.
            </ThemedText>
          ) : (
            current.workout.exercises.map((exercise, index) => {
              const entry = loggedEntry(exercise);
              const checked = !!entry;
              return (
                <Pressable
                  key={exercise.id}
                  onPress={() => toggle(exercise, entry)}
                  disabled={!canLog}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked, disabled: !canLog }}
                  accessibilityLabel={`${exercise.name}, ${describePlanned(exercise)}`}
                  style={[
                    styles.row,
                    index > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: colors.outlineVariant,
                    },
                  ]}>
                  {({ pressed }) => (
                    <>
                      <StateLayer color={colors.onSurface} pressed={pressed} />
                      {canLog &&
                        (checked ? (
                          // `secondary`: primary is kept for the main button.
                          <CircleCheck color={colors.secondary} size={24} aria-hidden />
                        ) : (
                          <Circle color={colors.onSurfaceVariant} size={24} aria-hidden />
                        ))}
                      <View style={styles.rowText}>
                        <ThemedText
                          numberOfLines={1}
                          themeColor={checked ? 'onSurfaceVariant' : 'onSurface'}
                          style={checked && styles.checked}>
                          {exercise.name}
                        </ThemedText>
                        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
                          {describePlanned(exercise)}
                        </ThemedText>
                      </View>
                    </>
                  )}
                </Pressable>
              );
            })
          )}

          {canLog &&
            (current.done ? (
              <Button
                label="Desfazer conclusão"
                variant="outlined"
                onPress={() => undoCompletion(date)}
              />
            ) : (
              <View style={styles.actions}>
                <Button
                  label="Iniciar treino"
                  icon={Play}
                  fullWidth
                  onPress={() =>
                    router.push({
                      pathname: '/workout-session',
                      params: { workoutId: current.workout.id, date },
                    })
                  }
                />
                <Button
                  label="Concluir sem cronômetro"
                  variant="outlined"
                  icon={Check}
                  fullWidth
                  onPress={complete}
                />
              </View>
            ))}
        </>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: -Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: MinTouchTarget + Spacing.two,
    marginHorizontal: -Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Shape.none,
    overflow: 'hidden',
  },
  rowText: {
    flex: 1,
  },
  actions: {
    gap: Spacing.two,
  },
  checked: {
    textDecorationLine: 'line-through',
  },
});
