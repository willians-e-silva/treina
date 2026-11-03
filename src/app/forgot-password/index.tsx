import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { StepScreen } from '@/components/signup/step-screen';
import { FormField } from '@/components/ui/form-field';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import { useSession } from '@/context/session';
import { AuthError, normalizeEmail } from '@/lib/auth';
import { EMAIL_PATTERN } from '@/lib/profile';

/** Step 1: the email that gets the reset code. */
export default function ForgotPasswordEmailScreen() {
  const { requestPasswordReset } = useSession();
  // Comes filled with what was typed on the login.
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const trimmedEmail = normalizeEmail(email);
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Informe um email válido.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(trimmedEmail);
      router.push({ pathname: '/forgot-password/code', params: { email: trimmedEmail } });
    } catch (e) {
      setError(
        e instanceof AuthError ? e.message : 'Não foi possível enviar o código. Tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          // First screen of the nested stack: goes back to the login.
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <StepScreen
        step={1}
        steps={3}
        title="Esqueceu a senha?"
        description="Informe o email da sua conta. Vamos enviar um código para você criar uma nova senha."
        error={error}
        submitLabel="Enviar código"
        submitting={submitting}
        onSubmit={submit}>
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@exemplo.com"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={submit}
          editable={!submitting}
          autoFocus
        />
      </StepScreen>
    </>
  );
}
