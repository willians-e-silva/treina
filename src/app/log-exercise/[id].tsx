import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatDecimal } from '@/components/dashboard/format';
import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import { useExerciseLog } from '@/context/exercise-log';
import { useTheme } from '@/hooks/use-theme';
import { MOCK_DASHBOARD } from '@/lib/dashboard-data';
import {
  CATEGORY_LABELS,
  estimateCalories,
  getExercise,
  toDateKey,
  type ExerciseCategory,
} from '@/lib/exercises';

// TODO: use the user's real latest weigh-in.
const BODY_WEIGHT_KG = MOCK_DASHBOARD.weight[MOCK_DASHBOARD.weight.length - 1].kg;

/** Parses user input like "12", "12,5" or "12.5"; `NaN` when invalid. */
function parseNumber(text: string) {
  return text.trim() === '' ? NaN : Number(text.replace(',', '.'));
}

export default function ExerciseDetailsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { addEntry } = useExerciseLog();
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
    exercise?.met && minutesValue > 0 ? estimateCalories(exercise.met, BODY_WEIGHT_KG, minutesValue) : 0;
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
      style={{ backgroundColor: theme.background }}
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
        <ThemedText type="small" themeColor="textSecondary">
          {CATEGORY_LABELS[category]}
        </ThemedText>
        <ThemedText style={styles.name} accessibilityRole="header">
          {name}
        </ThemedText>
        {details.length > 0 && (
          <ThemedText type="small" themeColor="textSecondary">
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
                  ? `Estimativa para ${formatDecimal(BODY_WEIGHT_KG)} kg`
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

      <Pressable
        onPress={save}
        disabled={!valid}
        accessibilityRole="button"
        accessibilityState={{ disabled: !valid }}
        style={({ pressed }) => [styles.save, (!valid || pressed) && styles.pressed]}>
        <ThemedText style={styles.saveText}>Adicionar</ThemedText>
      </Pressable>
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
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <View style={styles.fieldRow}>
        <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          keyboardType={integer ? 'number-pad' : 'decimal-pad'}
          selectTextOnFocus
          accessibilityLabel={label}
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSelected }]}
        />
      </View>
      {hint && (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      )}
    </View>
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
  gif: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 320,
    borderRadius: Spacing.four,
    // The GIFs have a white background; keep it in dark mode too.
    backgroundColor: '#ffffff',
  },
  name: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 700,
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
    height: 44,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    textAlign: 'right',
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
