import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { WorkoutExerciseList } from '@/components/trainers/workout-exercise-list';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getPackage } from '@/lib/trainers';

/** One workout of a trainer's package: the detailed description and the exercises with notes. */
export default function PackageWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { packageId, index } = useLocalSearchParams<{ packageId: string; index: string }>();
  const found = getPackage(packageId);
  const workout = found?.pkg.workouts[Number(index)];

  if (!found || !workout) {
    return (
      <View style={styles.missing}>
        <ThemedText themeColor="onSurfaceVariant">Treino não encontrado.</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: workout.name }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}>
        <View style={styles.group}>
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {found.pkg.name} · {found.trainer.name}
          </ThemedText>
          <ThemedText>{workout.description}</ThemedText>
        </View>

        <View style={styles.group}>
          <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
            Exercícios
          </ThemedText>
          <WorkoutExerciseList exercises={workout.exercises} />
        </View>
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
    gap: Spacing.two,
  },
});
