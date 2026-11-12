import { Stack, useLocalSearchParams, useNavigation, usePreventRemove } from 'expo-router';
import Check from 'lucide-react-native/icons/check';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import HeartPulse from 'lucide-react-native/icons/heart-pulse';
import Timer from 'lucide-react-native/icons/timer';
import X from 'lucide-react-native/icons/x';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ExerciseNote } from '@/components/trainers/exercise-note';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import { FeelingPicker } from '@/components/ui/feeling-picker';
import { Surface } from '@/components/ui/surface';
import { ThemedTextInput } from '@/components/ui/text-input';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useExerciseLog } from '@/context/exercise-log';
import { useSession } from '@/context/session';
import { useWorkoutPlan } from '@/context/workout-plan';
import { estimateCalories, toDateKey } from '@/lib/exercises';
import { parseDecimal } from '@/lib/profile';
import {
  describePlanned,
  formatDuration,
  type Feeling,
  type PlannedExercise,
} from '@/lib/workouts';
import { useAppTheme } from '@/theme';

/** What the user did for one exercise, as typed in the session. */
type Performed = {
  sets: string;
  reps: string;
  weight: string;
  minutes: string;
  done: boolean;
};

function initialPerformed(exercise: PlannedExercise): Performed {
  return exercise.category === 'cardio'
    ? { sets: '', reps: '', weight: '', minutes: String(exercise.minutes), done: false }
    : {
        sets: String(exercise.sets),
        reps: String(exercise.reps),
        weight: exercise.weightKg > 0 ? String(exercise.weightKg).replace('.', ',') : '',
        minutes: '',
        done: false,
      };
}

/** Whole number from user input, or `NaN`. */
function parseInteger(text: string) {
  const value = Number(text.trim());
  return text.trim() !== '' && Number.isInteger(value) ? value : NaN;
}

/**
 * A timed workout session: the clock runs from when it opens, each exercise
 * is marked done with the sets, reps and weight actually used (or minutes),
 * and finishing asks how the user feels before saving everything to the diary.
 */
export default function WorkoutSessionScreen() {
  const { colors, custom } = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ workoutId: string; date?: string }>();
  const date = params.date ?? toDateKey(new Date());
  const { workouts, completeWorkout } = useWorkoutPlan();
  const { entries, addEntry, removeEntry } = useExerciseLog();
  const bodyWeightKg = useSession().profile?.weightKg ?? null;
  const workout = workouts.find((candidate) => candidate.id === params.workoutId);

  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  /** Set when "Finalizar" is tapped: the clock stops and the review shows. */
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [performed, setPerformed] = useState<Record<string, Performed>>(() =>
    Object.fromEntries((workout?.exercises ?? []).map((e) => [e.id, initialPerformed(e)])),
  );
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  /** Set once saved: leaving no longer asks, and the screen closes. */
  const [saved, setSaved] = useState(false);
  const pendingLeave = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (finishedAt !== null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [finishedAt]);

  // Leaving mid-session (back button, swipe or close) discards it, after asking.
  usePreventRemove(!saved, ({ data }) => {
    pendingLeave.current = () => navigation.dispatch(data.action);
    setConfirmLeave(true);
  });

  // Closes after the save has turned the leave confirmation off.
  useEffect(() => {
    if (saved) navigation.goBack();
  }, [saved, navigation]);

  if (!workout) {
    return (
      <View style={styles.missing}>
        <ThemedText themeColor="onSurfaceVariant">Treino não encontrado.</ThemedText>
      </View>
    );
  }

  const elapsedSeconds = Math.floor(((finishedAt ?? now) - startedAt) / 1000);
  const doneCount = workout.exercises.filter((exercise) => performed[exercise.id]?.done).length;

  function update(id: string, change: Partial<Performed>) {
    setPerformed((current) => ({ ...current, [id]: { ...current[id], ...change } }));
  }

  /** Whether the typed values of an exercise can be logged. */
  function isValid(exercise: PlannedExercise) {
    const values = performed[exercise.id];
    if (exercise.category === 'cardio') return parseDecimal(values.minutes) > 0;
    const weight = values.weight.trim() === '' ? 0 : parseDecimal(values.weight);
    return parseInteger(values.sets) > 0 && parseInteger(values.reps) > 0 && weight >= 0;
  }

  function save() {
    if (!workout || feeling === null) return;
    for (const exercise of workout.exercises) {
      const values = performed[exercise.id];
      if (!values?.done) continue;
      // An earlier quick check of the same exercise is replaced by the session's numbers.
      const previous = entries.find((e) => e.date === date && e.plannedId === exercise.id);
      if (previous) removeEntry(previous.id);
      const base = { date, name: exercise.name, plannedId: exercise.id };
      if (exercise.category === 'cardio') {
        const minutes = parseDecimal(values.minutes);
        addEntry({
          ...base,
          category: 'cardio',
          minutes,
          calories:
            exercise.met && bodyWeightKg !== null
              ? estimateCalories(exercise.met, bodyWeightKg, minutes)
              : 0,
        });
      } else {
        addEntry({
          ...base,
          category: 'strength',
          sets: parseInteger(values.sets),
          reps: parseInteger(values.reps),
          weightKg: values.weight.trim() === '' ? 0 : parseDecimal(values.weight),
        });
      }
    }
    completeWorkout(date, workout.id, { durationSeconds: elapsedSeconds, feeling });
    setSaved(true);
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: workout.name,
          headerLeft: () => (
            <IconButton
              icon={X}
              color={colors.onSurface}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Sair do treino"
            />
          ),
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled">
        <Surface style={styles.clock}>
          <Timer color={colors.tertiary} size={24} aria-hidden />
          <ThemedText
            type="displayMedium"
            style={styles.time}
            accessibilityRole="timer"
            accessibilityLabel={`Tempo de treino: ${formatDuration(elapsedSeconds)}`}>
            {formatDuration(elapsedSeconds)}
          </ThemedText>
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {doneCount} de {workout.exercises.length} exercícios concluídos
          </ThemedText>
        </Surface>

        {finishedAt === null ? (
          <>
            {workout.exercises.map((exercise) => {
              const values = performed[exercise.id];
              const cardio = exercise.category === 'cardio';
              const Icon = cardio ? HeartPulse : Dumbbell;
              return (
                <Surface key={exercise.id} style={styles.exercise}>
                  <View style={styles.exerciseHeader}>
                    {values.done ? (
                      <CircleCheck color={colors.secondary} size={24} aria-hidden />
                    ) : (
                      <Icon
                        color={cardio ? custom.exercise.color : custom.protein.color}
                        size={24}
                        aria-hidden
                      />
                    )}
                    <View style={styles.flex}>
                      <ThemedText type="titleMedium" numberOfLines={2}>
                        {exercise.name}
                      </ThemedText>
                      <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
                        Planejado: {describePlanned(exercise)}
                      </ThemedText>
                      {!!exercise.note && <ExerciseNote note={exercise.note} />}
                    </View>
                  </View>

                  <View style={styles.fields}>
                    {cardio ? (
                      <Field
                        label="Minutos"
                        value={values.minutes}
                        onChangeText={(minutes) => update(exercise.id, { minutes })}
                      />
                    ) : (
                      <>
                        <Field
                          label="Séries"
                          value={values.sets}
                          integer
                          onChangeText={(sets) => update(exercise.id, { sets })}
                        />
                        <Field
                          label="Repetições"
                          value={values.reps}
                          integer
                          onChangeText={(reps) => update(exercise.id, { reps })}
                        />
                        <Field
                          label="Peso (kg)"
                          value={values.weight}
                          placeholder="Corporal"
                          onChangeText={(weight) => update(exercise.id, { weight })}
                        />
                      </>
                    )}
                  </View>

                  {values.done ? (
                    <Button
                      label="Desfazer"
                      variant="outlined"
                      onPress={() => update(exercise.id, { done: false })}
                    />
                  ) : (
                    <Button
                      label="Concluir exercício"
                      variant="tonal"
                      icon={Check}
                      disabled={!isValid(exercise)}
                      onPress={() => update(exercise.id, { done: true })}
                    />
                  )}
                </Surface>
              );
            })}

            <Button
              label="Finalizar treino"
              size="medium"
              fullWidth
              onPress={() => setFinishedAt(Date.now())}
            />
          </>
        ) : (
          <Surface style={styles.review}>
            <ThemedText type="titleLarge" emphasized accessibilityRole="header">
              Como você está se sentindo?
            </ThemedText>
            <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
              Toque na carinha que mais combina com você depois do treino.
            </ThemedText>
            <FeelingPicker value={feeling} onChange={setFeeling} />

            <Button
              label="Salvar treino"
              size="medium"
              fullWidth
              disabled={feeling === null}
              onPress={save}
            />
            <Button
              label="Voltar ao treino"
              variant="text"
              tone="secondary"
              onPress={() => setFinishedAt(null)}
              style={styles.center}
            />
          </Surface>
        )}
      </ScrollView>

      <Dialog
        visible={confirmLeave}
        title="Sair do treino?"
        onDismiss={() => setConfirmLeave(false)}
        actions={
          <>
            <Button label="Continuar" variant="text" onPress={() => setConfirmLeave(false)} />
            <Button
              label="Sair"
              variant="text"
              tone="error"
              onPress={() => {
                setConfirmLeave(false);
                pendingLeave.current?.();
              }}
            />
          </>
        }>
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          O tempo e os exercícios registrados nesta sessão serão descartados.
        </ThemedText>
      </Dialog>
    </>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  integer?: boolean;
};

function Field({ label, value, onChangeText, placeholder, integer }: FieldProps) {
  return (
    <View style={styles.field}>
      <ThemedText type="labelMedium" themeColor="onSurfaceVariant">
        {label}
      </ThemedText>
      <ThemedTextInput
        size="compact"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={integer ? 'number-pad' : 'decimal-pad'}
        selectTextOnFocus
        accessibilityLabel={label}
        style={styles.input}
      />
    </View>
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
    gap: Spacing.three,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  clock: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.four,
  },
  time: {
    // Digits keep the same width, so the clock does not jitter as it ticks.
    fontVariant: ['tabular-nums'],
  },
  exercise: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
  },
  fields: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  field: {
    flex: 1,
    gap: Spacing.one,
  },
  input: {
    textAlign: 'center',
  },
  review: {
    gap: Spacing.three,
  },
  center: {
    alignSelf: 'center',
  },
});
