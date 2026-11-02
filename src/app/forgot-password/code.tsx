import { Redirect, router, useLocalSearchParams } from 'expo-router';
import Info from 'lucide-react-native/icons/info';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { StepScreen } from '@/components/signup/step-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/context/session';
import { AuthError, RESET_CODE_LENGTH, RESET_CODE_TTL_MS, RESET_RESEND_DELAY_S } from '@/lib/auth';
import { Shape, useAppTheme } from '@/theme';

/** Step 2: the code sent to the email. */
export default function ForgotPasswordCodeScreen() {
  const { colors } = useAppTheme();
  const { requestPasswordReset, verifyResetCode } = useSession();
  const params = useLocalSearchParams<{ email?: string; code?: string }>();
  const email = params.email;

  const [code, setCode] = useState('');
  // TEMPORARY: the code shown on screen while no email is sent.
  const [sentCode, setSentCode] = useState(params.code);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(RESET_RESEND_DELAY_S);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  // Reached without the first step, e.g. a reload on web.
  if (!email) return <Redirect href="/forgot-password" />;

  async function submit() {
    if (!email) return;
    if (code.trim().length !== RESET_CODE_LENGTH) {
      setError(`Informe o código de ${RESET_CODE_LENGTH} dígitos.`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await verifyResetCode(email, code);
      router.push({
        pathname: '/forgot-password/new-password',
        params: { email, code: code.trim() },
      });
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível verificar o código.');
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    if (!email) return;
    setError(null);
    setResending(true);
    try {
      setSentCode(await requestPasswordReset(email));
      setCode('');
      setResendIn(RESET_RESEND_DELAY_S);
    } catch {
      setError('Não foi possível reenviar o código. Tente novamente.');
    } finally {
      setResending(false);
    }
  }

  return (
    <StepScreen
      step={2}
      steps={3}
      title="Digite o código"
      description={`Se houver uma conta com ${email}, você vai receber um código de ${RESET_CODE_LENGTH} dígitos. Ele vale por ${RESET_CODE_TTL_MS / 60000} minutos.`}
      error={error}
      submitLabel="Verificar código"
      submitting={submitting}
      onSubmit={submit}>
      {sentCode && (
        <View style={[styles.demo, { backgroundColor: colors.surfaceContainerHigh }]}>
          <Info color={colors.onSurfaceVariant} size={20} />
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" style={styles.flex}>
            Modo de teste: o envio de email ainda não existe. Use o código{' '}
            <ThemedText type="bodyMedium" emphasized>
              {sentCode}
            </ThemedText>
            .
          </ThemedText>
        </View>
      )}

      <FormField
        label="Código"
        value={code}
        onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
        placeholder="000000"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={RESET_CODE_LENGTH}
        returnKeyType="done"
        onSubmitEditing={submit}
        editable={!submitting}
        autoFocus
      />

      <View style={styles.resendRow}>
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          Não recebeu?
        </ThemedText>
        <Button
          label={resendIn > 0 ? `Reenviar em ${resendIn}s` : 'Reenviar código'}
          variant="text"
          tone="secondary"
          loading={resending}
          disabled={resendIn > 0 || submitting}
          onPress={resend}
        />
      </View>
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    borderRadius: Shape.medium,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
