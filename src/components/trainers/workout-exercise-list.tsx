import Dumbbell from 'lucide-react-native/icons/dumbbell';
import HeartPulse from 'lucide-react-native/icons/heart-pulse';
import { StyleSheet, View } from 'react-native';

import { ExerciseNote } from './exercise-note';

import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { describePlanned, type NewPlannedExercise } from '@/lib/workouts';
import { useAppTheme } from '@/theme';

/** A workout's exercises with what is planned and the trainer's notes. */
export function WorkoutExerciseList({ exercises }: { exercises: NewPlannedExercise[] }) {
  const { colors, custom } = useAppTheme();

  return (
    <Surface style={styles.list}>
      {exercises.map((exercise, index) => {
        const cardio = exercise.category === 'cardio';
        const Icon = cardio ? HeartPulse : Dumbbell;
        return (
          <View
            key={`${exercise.name}-${index}`}
            style={[
              styles.row,
              index > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.outlineVariant,
              },
            ]}>
            <Icon
              color={cardio ? custom.exercise.color : custom.protein.color}
              size={20}
              style={styles.icon}
              aria-hidden
            />
            <View style={styles.text}>
              <ThemedText>{exercise.name}</ThemedText>
              <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
                {describePlanned(exercise)}
              </ThemedText>
              {!!exercise.note && <ExerciseNote note={exercise.note} />}
            </View>
          </View>
        );
      })}
    </Surface>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
  },
});
