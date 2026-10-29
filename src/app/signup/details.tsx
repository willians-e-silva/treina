import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StepScreen } from '@/components/signup/step-screen';
import { ThemedText } from '@/components/themed-text';
import { FormField } from '@/components/ui/form-field';
import { PickerField } from '@/components/ui/picker-field';
import { Brand, Spacing } from '@/constants/theme';
import { useSession } from '@/context/session';
import { useSignup } from '@/context/signup';
import { useTheme } from '@/hooks/use-theme';
import { AGE_OPTIONS, HEIGHT_OPTIONS, parseDecimal, SEX_LABELS, type Sex } from '@/lib/profile';

const SEXES: Sex[] = ['female', 'male', 'unspecified'];

/** Step 2: age, sex, height and current weight. */
export default function SignupDetailsScreen() {
  const theme = useTheme();
  const { signUp } = useSession();
  const { account } = useSignup();

  const [age, setAge] = useState<number | null>(null);
  const [sex, setSex] = useState<Sex | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [weight, setWeight] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reached without the first step, e.g. a reload on web.
  if (!account) return <Redirect href="/signup" />;

  async function submit() {
    if (!account) return;
    const weightValue = parseDecimal(weight);
    if (age === null) {
      setError('Selecione sua idade.');
      return;
    }
    if (!sex) {
      setError('Selecione uma opção de sexo.');
      return;
    }
    if (height === null) {
      setError('Selecione sua altura.');
      return;
    }
    if (!(weightValue >= 30 && weightValue <= 400)) {
      setError('Informe um peso entre 30 e 400 kg.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      // On success the root layout's guard swaps the sign-up for the tabs.
      await signUp({
        ...account,
        age,
        sex,
        heightCm: height,
        weightKg: Math.round(weightValue * 10) / 10,
      });
    } catch {
      setError('Não foi possível criar a conta. Tente novamente.');
      setSubmitting(false);
    }
  }

  return (
    <StepScreen
      step={2}
      steps={2}
      title="Sobre você"
      description="Usamos esses dados para estimar suas calorias e acompanhar seu progresso."
      error={error}
      submitLabel="Criar conta"
      submitting={submitting}
      onSubmit={submit}>
      <PickerField
        label="Idade"
        options={AGE_OPTIONS}
        value={age}
        onChange={setAge}
        unit="anos"
        initialValue={25}
        disabled={submitting}
      />

      <View style={styles.field}>
        <ThemedText type="smallBold">Sexo</ThemedText>
        <View
          style={[styles.segmented, { backgroundColor: theme.backgroundElement }]}
          accessibilityRole="radiogroup">
          {SEXES.map((value) => (
            <Pressable
              key={value}
              onPress={() => setSex(value)}
              disabled={submitting}
              accessibilityRole="radio"
              accessibilityState={{ checked: sex === value }}
              style={[styles.segment, sex === value && styles.segmentSelected]}>
              <ThemedText
                type="smallBold"
                numberOfLines={1}
                adjustsFontSizeToFit
                style={sex === value ? styles.segmentSelectedText : undefined}>
                {SEX_LABELS[value]}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <PickerField
        label="Altura"
        options={HEIGHT_OPTIONS}
        value={height}
        onChange={setHeight}
        unit="cm"
        initialValue={170}
        disabled={submitting}
      />
      <FormField
        label="Peso atual"
        value={weight}
        onChangeText={setWeight}
        unit="kg"
        placeholder="70,5"
        keyboardType="decimal-pad"
        returnKeyType="done"
        onSubmitEditing={submit}
        maxLength={5}
        editable={!submitting}
      />
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  segmented: {
    flexDirection: 'row',
    height: 52,
    borderRadius: Spacing.three,
    padding: Spacing.one,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
    borderRadius: Spacing.three - Spacing.one,
  },
  segmentSelected: {
    backgroundColor: Brand.primary,
  },
  segmentSelectedText: {
    color: Brand.onPrimary,
  },
});
