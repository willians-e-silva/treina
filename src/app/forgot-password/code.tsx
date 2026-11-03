import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { CodeField } from '@/components/auth/code-field';
import { StepScreen } from '@/components/signup/step-screen';
import { useSession } from '@/context/session';
import { AuthError, CODE_LENGTH, CODE_TTL_LABEL } from '@/lib/auth';

/** Step 2: the code sent to the email. */
export default function ForgotPasswordCodeScreen() {
  const { requestPasswordReset, verifyResetCode } = useSession();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reached without the first step, e.g. a reload on web.
  if (!email) return <Redirect href="/forgot-password" />;

  async function submit() {
    if (!email) return;
    if (code.trim().length !== CODE_LENGTH) {
      setError(`Informe o código de ${CODE_LENGTH} dígitos.`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await verifyResetCode(email, code);
      router.push({ pathname: '/forgot-password/new-password', params: { email } });
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível verificar o código.');
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    if (!email) return;
    setError(null);
    try {
      await requestPasswordReset(email);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível reenviar o código.');
      throw e;
    }
  }

  return (
    <StepScreen
      step={2}
      steps={3}
      title="Digite o código"
      description={`Se houver uma conta com ${email}, você vai receber um código de ${CODE_LENGTH} dígitos. Ele vale por ${CODE_TTL_LABEL}.`}
      error={error}
      submitLabel="Verificar código"
      submitting={submitting}
      onSubmit={submit}>
      <CodeField
        code={code}
        onChangeCode={setCode}
        onSubmit={submit}
        onResend={resend}
        disabled={submitting}
      />
    </StepScreen>
  );
}
