import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatDecimal } from '@/components/dashboard/format';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { ThemedTextInput } from '@/components/ui/text-input';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useExerciseLog } from '@/context/exercise-log';
import { useSession } from '@/context/session';
import { MOCK_PROFILE } from '@/lib/profile';
import {
  CATEGORY_LABELS,
  estimateCalories,
  getExercise,
  toDateKey,
  type ExerciseCategory,
} from '@/lib/exercises';
import { ComponentShape, MediaColors } from '@/theme';

/** Parses user input like "12", "12,5" or "12.5"; `NaN` when invalid. */
function parseNumber(text: string) {
  return text.trim() === '' ? NaN : Number(text.replace(',', '.'));
}

export default function ExerciseDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { addEntry } = useExerciseLog();
  const bodyWeightKg = useSession().profile?.weightKg ?? MOCK_PROFILE.weightKg;
  const params = useLocalSearchParams<{
    id: string;
    date?: string;
    name?: string;
    category?: ExerciseCategory;
  }>();
  const exercise = getExercise(params.id);
  const name = exercise?.name ?? params.name ?? 'Exercício';
  const category = exercise?.category ?? (params.category === 'strength' ? 'strength' : 'cardio');
  const date = params.date ?? toDateKey(new Date());
  const details = [
    exercise?.target,
    exercise?.equipment,
    exercise?.met ? `MET ${formatDecimal(exercise.met)}` : undefined,
  ].filter(Boolean);

  const [minutes, setMinutes] = useState('30');
  // `null` while the calories follow the estimate; set once the user edits them.
  const [caloriesOverride, setCaloriesOverride] = useState<string | null>(null);
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');

  const minutesValue = parseNumber(minutes);
  const estimated =
    exercise?.met && minutesValue > 0 ? estimateCalories(exercise.met, bodyWeightKg, minutesValue) : 0;
  const calories = caloriesOverride ?? String(estimated);
  const caloriesValue = parseNumber(calories);
  const setsValue = parseNumber(sets);
  const repsValue = parseNumber(reps);
  const weightValue = weight.trim() === '' ? 0 : parseNumber(weight);

  const valid =
    category === 'cardio'
      ? minutesValue > 0 && caloriesValue >= 0
      : Number.isInteger(setsValue) && setsValue > 0 && Number.isInteger(repsValue) && repsValue > 0 && weightValue >= 0;

  function save() {
    if (!valid) return;
    if (category === 'cardio') {
      addEntry({ date, name, category, minutes: minutesValue, calories: Math.round(caloriesValue) });
    } else {
      addEntry({ date, name, category, sets: setsValue, reps: repsValue, weightKg: weightValue });
    }
    // Close the whole modal (search + details), back to the diary.
    navigation.getParent()?.goBack();
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
      keyboardShouldPersistTaps="handled">
      {exercise?.gifUrl && (
        <Image
          source={exercise.gifUrl}
          contentFit="contain"
          style={styles.gif}
          accessibilityLabel={`Demonstração: ${name}`}
        />
      )}

      <View>
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          {CATEGORY_LABELS[category]}
        </ThemedText>
        <ThemedText type="headlineSmall" emphasized accessibilityRole="header">
          {name}
        </ThemedText>
        {details.length > 0 && (
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {details.join(' · ')}
          </ThemedText>
        )}
      </View>

      <Surface style={styles.form}>
        {category === 'cardio' ? (
          <>
            <Field label="Duração (minutos)" value={minutes} onChangeText={setMinutes} />
            <Field
              label="Calorias queimadas"
              value={calories}
              onChangeText={setCaloriesOverride}
              hint={
                exercise?.met && caloriesOverride === null
                  ? `Estimativa para ${formatDecimal(bodyWeightKg)} kg`
                  : undefined
              }
            />
          </>
        ) : (
          <>
            <Field label="Séries" value={sets} onChangeText={setSets} integer />
            <Field label="Repetições por série" value={reps} onChangeText={setReps} integer />
            <Field label="Peso por série (kg)" value={weight} onChangeText={setWeight} placeholder="Peso corporal" />
          </>
        )}
      </Surface>

      <Button label="Adicionar" size="medium" fullWidth onPress={save} disabled={!valid} />
    </ScrollView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  hint?: string;
  integer?: boolean;
};

function Field({ label, value, onChangeText, placeholder, hint, integer }: FieldProps) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldRow}>
        <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
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
      {hint && (
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          {hint}
        </ThemedText>
      )}
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
    gap: Spacing.four,
  },
  gif: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 320,
    borderRadius: ComponentShape.card,
    backgroundColor: MediaColors.exerciseGif,
  },
  form: {
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  field: {
    gap: Spacing.one,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  fieldLabel: {
    flex: 1,
  },
  input: {
    width: 120,
    textAlign: 'right',
  },
});
