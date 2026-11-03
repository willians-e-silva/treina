import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { ResendEmail } from '@/components/auth/resend-email';
import { StepScreen } from '@/components/signup/step-screen';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import { useSession } from '@/context/session';
import { AuthError } from '@/lib/auth';

/**
 * Step 3: the account is confirmed with the link in the email, which opens
 * the app signed in (`auth/callback`). Also opened from the login when the
 * account exists but was never confirmed (`sent=0`).
 */
export default function SignupConfirmScreen() {
  const { resendConfirmation } = useSession();
  const { email, sent } = useLocalSearchParams<{ email?: string; sent?: string }>();
  const [error, setError] = useState<string | null>(null);

  // Reached without an email, e.g. a reload on web.
  if (!email) return <Redirect href="/signup" />;

  async function resend() {
    if (!email) return;
    setError(null);
    try {
      await resendConfirmation(email);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível reenviar o email.');
      throw e;
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          // From the login it is the first screen of the nested stack.
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <StepScreen
        step={3}
        steps={3}
        title="Confirme seu email"
        description={
          sent === '0'
            ? `Para entrar, confirme ${email} pelo link que enviamos no cadastro. Abra o email neste celular e toque no link.`
            : `Enviamos um link para ${email}. Abra o email neste celular e toque no link para entrar.`
        }
        error={error}
        submitLabel="Já confirmei, entrar"
        onSubmit={() => router.dismissTo('/login')}>
        <ResendEmail onResend={resend} sent={sent !== '0'} />
      </StepScreen>
    </>
  );
}
