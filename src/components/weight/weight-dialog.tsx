import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatDecimal } from '@/components/dashboard/format';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { useSession } from '@/context/session';
import { useWeightLog } from '@/context/weight-log';
import {
  isValidWeight,
  MOCK_PROFILE,
  parseDecimal,
  WEIGHT_MAX_KG,
  WEIGHT_MIN_KG,
} from '@/lib/profile';

/** `current`: logs today's weight; `goal`: sets the target weight. */
export type WeightDialogMode = 'current' | 'goal';

const TITLES: Record<WeightDialogMode, string> = {
  current: 'Registrar peso',
  goal: 'Meta de peso',
};

type WeightDialogProps = {
  mode: WeightDialogMode;
  onDismiss: () => void;
};

/**
 * Dialog to log the current weight or set the goal. Mount it only while it
 * is open, so the field starts from the saved value each time.
 */
export function WeightDialog({ mode, onDismiss }: WeightDialogProps) {
  const { goalKg, logWeight, setGoal } = useWeightLog();
  const currentKg = useSession().profile?.weightKg ?? MOCK_PROFILE.weightKg;
  const initial = mode === 'current' ? currentKg : goalKg;
  const [text, setText] = useState(initial === undefined ? '' : formatDecimal(initial));
  const [error, setError] = useState<string | null>(null);

  function save() {
    const kg = parseDecimal(text);
    if (!isValidWeight(kg)) {
      setError(`Informe um peso entre ${WEIGHT_MIN_KG} e ${WEIGHT_MAX_KG} kg.`);
      return;
    }
    const rounded = Math.round(kg * 10) / 10;
    if (mode === 'current') logWeight(rounded);
    else setGoal(rounded);
    onDismiss();
  }

  return (
    <Dialog
      visible
      title={TITLES[mode]}
      onDismiss={onDismiss}
      actions={
        <>
          {mode === 'goal' && goalKg !== undefined && (
            <View style={styles.remove}>
              <Button
                label="Remover"
                variant="text"
                tone="error"
                onPress={() => {
                  setGoal(undefined);
                  onDismiss();
                }}
              />
            </View>
          )}
          <Button label="Cancelar" variant="text" onPress={onDismiss} />
          <Button label="Salvar" variant="text" onPress={save} />
        </>
      }>
      <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
        {mode === 'current'
          ? 'O peso fica registrado com a data de hoje e passa a ser o seu peso atual.'
          : `Seu peso atual é ${formatDecimal(currentKg)} kg.`}
      </ThemedText>
      <FormField
        label={mode === 'current' ? 'Peso atual' : 'Peso desejado'}
        unit="kg"
        value={text}
        onChangeText={(value) => {
          setText(value);
          setError(null);
        }}
        keyboardType="decimal-pad"
        returnKeyType="done"
        onSubmitEditing={save}
        autoFocus
        selectTextOnFocus
      />
      {error && (
        <ThemedText type="bodyMedium" themeColor="error" accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      )}
    </Dialog>
  );
}

const styles = StyleSheet.create({
  remove: {
    // Destructive action on the start side, away from Salvar.
    marginRight: 'auto',
  },
});

/** "Faltam 7,1 kg para a meta" / "Meta atingida", for a goal that is set. */
export function describeGoalProgress(currentKg: number, goalKg: number) {
  const remaining = Math.abs(currentKg - goalKg);
  return remaining < 0.05 ? 'Meta atingida' : `Faltam ${formatDecimal(remaining)} kg para a meta`;
}
