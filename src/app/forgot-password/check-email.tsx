import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { ResendEmail } from '@/components/auth/resend-email';
import { StepScreen } from '@/components/signup/step-screen';
import { useSession } from '@/context/session';
import { AuthError } from '@/lib/auth';

/** Step 2: the link sent to the email opens the app on the new password. */
export default function ForgotPasswordCheckEmailScreen() {
  const { requestPasswordReset } = useSession();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [error, setError] = useState<string | null>(null);

  // Reached without the first step, e.g. a reload on web.
  if (!email) return <Redirect href="/forgot-password" />;

  async function resend() {
    if (!email) return;
    setError(null);
    try {
      await requestPasswordReset(email);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível reenviar o email.');
      throw e;
    }
  }

  return (
    <StepScreen
      step={2}
      steps={3}
      title="Verifique seu email"
      description={`Se houver uma conta com ${email}, você vai receber um link para criar uma nova senha. Abra o email neste celular e toque no link.`}
      error={error}
      submitLabel="Voltar para o login"
      onSubmit={() => router.dismissTo('/login')}>
      <ResendEmail onResend={resend} />
    </StepScreen>
  );
}
