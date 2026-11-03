import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { RESEND_DELAY_S } from '@/lib/auth';

type ResendEmailProps = {
  /** Sends the email again; rejects to keep the wait from starting. */
  onResend: () => Promise<void>;
  disabled?: boolean;
  /** `false` when no email was sent yet, so it can be requested right away. */
  sent?: boolean;
};

/** "Não recebeu?" and a button to send an auth email again, after a short wait. */
export function ResendEmail({ onResend, disabled, sent = true }: ResendEmailProps) {
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
      setResendIn(RESEND_DELAY_S);
    } catch {
      // The screen shows the error.
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={styles.row}>
      <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
        {sent ? 'Não recebeu?' : 'Precisa de um novo link?'}
      </ThemedText>
      <Button
        label={resendIn > 0 ? `Reenviar em ${resendIn}s` : sent ? 'Reenviar email' : 'Enviar link'}
        variant="text"
        tone="secondary"
        loading={resending}
        disabled={resendIn > 0 || disabled}
        onPress={resend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
