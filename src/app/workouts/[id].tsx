import { router, Stack, useLocalSearchParams } from 'expo-router';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import HeartPulse from 'lucide-react-native/icons/heart-pulse';
import Lock from 'lucide-react-native/icons/lock';
import Trash from 'lucide-react-native/icons/trash';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ExerciseNote } from '@/components/trainers/exercise-note';
import { WorkoutSourceRow } from '@/components/trainers/workout-source';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { IconButton } from '@/components/ui/icon-button';
import { Surface } from '@/components/ui/surface';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useWorkoutPlan } from '@/context/workout-plan';
import { CATEGORY_LABELS } from '@/lib/exercises';
import { describePlanned } from '@/lib/workouts';
import { useAppTheme } from '@/theme';

/**
 * Name and exercises of one workout. Changes are saved as they are made; a
 * trainer's workout is read-only.
 */
export default function WorkoutScreen() {
  const { colors, custom } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts, renameWorkout, removeWorkout, removeExercise } = useWorkoutPlan();
  const workout = workouts.find((candidate) => candidate.id === id);

  if (!workout) {
    // Deleted, or lost with the in-memory plan after a reload.
    return (
      <View style={styles.missing}>
        <ThemedText themeColor="onSurfaceVariant">Treino não encontrado.</ThemedText>
      </View>
    );
  }

  const locked = !!workout.source;

  function addExercise(category: 'strength' | 'cardio') {
    router.push({ pathname: '/log-exercise', params: { category, workoutId: id } });
  }

  function deleteWorkout() {
    removeWorkout(id);
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: workout.name || 'Treino' }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled">
        {workout.source ? (
          <Surface style={styles.locked}>
            <WorkoutSourceRow source={workout.source} />
            <View style={styles.lockedNote}>
              <Lock color={colors.onSurfaceVariant} size={16} aria-hidden />
              <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" style={styles.rowText}>
                Treinos de um treinador não podem ser alterados. Para tirá-lo do planejamento, saia
                do pacote.
              </ThemedText>
            </View>
          </Surface>
        ) : (
          <FormField
            label="Nome do treino"
            value={workout.name}
            onChangeText={(name) => renameWorkout(id, name)}
            placeholder="Treino A – Peito"
            returnKeyType="done"
          />
        )}

        {!!workout.description && <ThemedText>{workout.description}</ThemedText>}

        <View style={styles.group}>
          <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
            Exercícios
          </ThemedText>
          {workout.exercises.length === 0 ? (
            <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
              Nenhum exercício neste treino.
            </ThemedText>
          ) : (
            <Surface style={styles.list}>
              {workout.exercises.map((exercise, index) => {
                const Icon = exercise.category === 'cardio' ? HeartPulse : Dumbbell;
                return (
                  <View
                    key={exercise.id}
                    style={[
                      styles.row,
                      index > 0 && {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: colors.outlineVariant,
                      },
                    ]}>
                    <Icon
                      color={
                        exercise.category === 'cardio'
                          ? custom.exercise.color
                          : custom.protein.color
                      }
                      size={20}
                      aria-hidden
                    />
                    <View style={styles.rowText}>
                      <ThemedText numberOfLines={1}>{exercise.name}</ThemedText>
                      <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
                        {CATEGORY_LABELS[exercise.category]} · {describePlanned(exercise)}
                      </ThemedText>
                      {!!exercise.note && <ExerciseNote note={exercise.note} />}
                    </View>
                    {!locked && (
                      <IconButton
                        icon={Trash}
                        onPress={() => removeExercise(id, exercise.id)}
                        accessibilityLabel={`Remover ${exercise.name}`}
                      />
                    )}
                  </View>
                );
              })}
            </Surface>
          )}
          {!locked && (
            <View style={styles.actions}>
              <Button
                label="Musculação"
                variant="tonal"
                icon={Dumbbell}
                onPress={() => addExercise('strength')}
                accessibilityLabel="Adicionar exercício de musculação"
              />
              <Button
                label="Cardio"
                variant="tonal"
                icon={HeartPulse}
                onPress={() => addExercise('cardio')}
                accessibilityLabel="Adicionar exercício cardiovascular"
              />
            </View>
          )}
        </View>

        {!locked && (
          <Button
            label="Excluir treino"
            variant="outlined"
            tone="error"
            icon={Trash}
            onPress={deleteWorkout}
            style={styles.delete}
          />
        )}
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
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  group: {
    gap: Spacing.three,
  },
  list: {
    paddingVertical: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  rowText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  delete: {
    alignSelf: 'center',
  },
  locked: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  lockedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
