import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Spacing } from '@/constants/theme';
import { CODE_LENGTH, RESEND_DELAY_S } from '@/lib/auth';

type CodeFieldProps = {
  code: string;
  onChangeCode: (code: string) => void;
  onSubmit: () => void;
  /** Sends a new code; rejects to keep the wait from starting. */
  onResend: () => Promise<void>;
  disabled?: boolean;
  /** `false` when no code was sent yet, so it can be requested right away. */
  sent?: boolean;
};

/** Field for a code emailed by Supabase Auth, with a button to send a new one. */
export function CodeField({
  code,
  onChangeCode,
  onSubmit,
  onResend,
  disabled,
  sent = true,
}: CodeFieldProps) {
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(sent ? RESEND_DELAY_S : 0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  async function resend() {
    setResending(true);
    try {
      await onResend();
      onChangeCode('');
      setResendIn(RESEND_DELAY_S);
    } catch {
      // The screen shows the error.
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <FormField
        label="Código"
        value={code}
        onChangeText={(value) => onChangeCode(value.replace(/\D/g, ''))}
        placeholder={'0'.repeat(CODE_LENGTH)}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={CODE_LENGTH}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        editable={!disabled}
        autoFocus
      />

      <View style={styles.resendRow}>
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          {sent ? 'Não recebeu?' : 'Precisa de um código?'}
        </ThemedText>
        <Button
          label={
            resendIn > 0 ? `Reenviar em ${resendIn}s` : sent ? 'Reenviar código' : 'Enviar código'
          }
          variant="text"
          tone="secondary"
          loading={resending}
          disabled={resendIn > 0 || disabled}
          onPress={resend}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
