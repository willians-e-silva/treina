import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { StepScreen } from '@/components/signup/step-screen';
import { ThemedText } from '@/components/themed-text';
import { FormField } from '@/components/ui/form-field';
import { PickerField } from '@/components/ui/picker-field';
import { SegmentedButtons } from '@/components/ui/segmented-buttons';
import { Spacing } from '@/constants/theme';
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

export type BodyDataValues = {
  /** `YYYY-MM-DD`. */
  birthDate: string;
  sex: Sex;
  heightCm: number;
  /** Rounded to one decimal. */
  weightKg: number;
};

type BodyDataStepProps = {
  step: number;
  steps: number;
  title: string;
  description: string;
  submitLabel: string;
  /** Fields already known, e.g. part of a profile from Google. */
  initial?: Partial<BodyDataValues>;
  /** A rejection shows `toMessage(error)` under the fields. */
  onSubmit: (values: BodyDataValues) => Promise<void>;
  toMessage: (error: unknown) => string;
  footer?: ReactNode;
};

/** Birth date, sex, height and current weight, validated. Shared by the sign-up and the profile completion. */
export function BodyDataStep({
  initial,
  onSubmit,
  toMessage,
  ...screen
}: BodyDataStepProps) {
  const [birthDate, setBirthDate] = useState(() => {
    if (!initial?.birthDate) return '';
    const [year, month, day] = initial.birthDate.split('-');
    return `${day}/${month}/${year}`;
  });
  const [sex, setSex] = useState<Sex | null>(initial?.sex ?? null);
  const [height, setHeight] = useState<number | null>(initial?.heightCm ?? null);
  const [weight, setWeight] = useState(
    initial?.weightKg === undefined ? '' : String(initial.weightKg).replace('.', ','),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (submitting) return;
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
      await onSubmit({
        birthDate: birthDateKey,
        sex,
        heightCm: height,
        weightKg: Math.round(weightValue * 10) / 10,
      });
    } catch (e) {
      setError(toMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StepScreen {...screen} error={error} submitting={submitting} onSubmit={submit}>
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
