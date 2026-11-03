import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { StepScreen } from '@/components/signup/step-screen';
import { ThemedText } from '@/components/themed-text';
import { FormField } from '@/components/ui/form-field';
import { PickerField } from '@/components/ui/picker-field';
import { SegmentedButtons } from '@/components/ui/segmented-buttons';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/context/session';
import { useSignup } from '@/context/signup';
import { AuthError } from '@/lib/auth';
import { toDateKey } from '@/lib/exercises';
import {
  AGE_MAX,
  AGE_MIN,
  ageOn,
  HEIGHT_OPTIONS,
  isValidWeight,
  maskDate,
  parseDate,
  parseDecimal,
  SEX_LABELS,
  WEIGHT_MAX_KG,
  WEIGHT_MIN_KG,
  type Sex,
} from '@/lib/profile';

const SEXES: Sex[] = ['female', 'male', 'unspecified'];

/** Step 2: birth date, sex, height and current weight. */
export default function SignupDetailsScreen() {
  const { signUp } = useSession();
  const { account } = useSignup();

  const [birthDate, setBirthDate] = useState('');
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
    const birthDateKey = parseDate(birthDate);
    if (!birthDateKey) {
      setError('Informe sua data de nascimento no formato DD/MM/AAAA.');
      return;
    }
    const age = ageOn(birthDateKey, toDateKey(new Date()));
    if (age < AGE_MIN || age > AGE_MAX) {
      setError(`É preciso ter entre ${AGE_MIN} e ${AGE_MAX} anos para usar o Treina.`);
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
    if (!isValidWeight(weightValue)) {
      setError(`Informe um peso entre ${WEIGHT_MIN_KG} e ${WEIGHT_MAX_KG} kg.`);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const { needsConfirmation } = await signUp({
        ...account,
        birthDate: birthDateKey,
        sex,
        heightCm: height,
        weightKg: Math.round(weightValue * 10) / 10,
      });
      if (needsConfirmation) {
        setSubmitting(false);
        router.push({ pathname: '/signup/confirm', params: { email: account.email } });
      }
      // Otherwise the user is signed in, and the root layout's guard swaps the
      // sign-up for the tabs.
    } catch (e) {
      setError(
        e instanceof AuthError ? e.message : 'Não foi possível criar a conta. Tente novamente.',
      );
      setSubmitting(false);
    }
  }

  return (
    <StepScreen
      step={2}
      steps={3}
      title="Sobre você"
      description="Usamos esses dados para estimar suas calorias e acompanhar seu progresso."
      error={error}
      submitLabel="Criar conta"
      submitting={submitting}
      onSubmit={submit}>
      <FormField
        label="Data de nascimento"
        value={birthDate}
        onChangeText={(value) => setBirthDate(maskDate(value))}
        placeholder="DD/MM/AAAA"
        keyboardType="number-pad"
        autoComplete="birthdate-full"
        maxLength={10}
        editable={!submitting}
      />

      <View style={styles.field}>
        <ThemedText type="labelLarge" themeColor="onSurfaceVariant">
          Sexo
        </ThemedText>
        <SegmentedButtons
          options={SEXES.map((value) => ({ value, label: SEX_LABELS[value] }))}
          value={sex}
          onChange={setSex}
          disabled={submitting}
        />
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
});
