import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { CodeField } from '@/components/auth/code-field';
import { StepScreen } from '@/components/signup/step-screen';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import { useSession } from '@/context/session';
import { AuthError, CODE_LENGTH, CODE_TTL_LABEL } from '@/lib/auth';

/**
 * Step 3: the code emailed to confirm the account. Also opened from the login
 * when the account exists but was never confirmed (`sent=0`).
 */
export default function SignupConfirmScreen() {
  const { confirmSignUp, resendSignUpCode } = useSession();
  const { email, sent } = useLocalSearchParams<{ email?: string; sent?: string }>();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reached without an email, e.g. a reload on web.
  if (!email) return <Redirect href="/signup" />;

  async function submit() {
    if (!email) return;
    if (code.trim().length !== CODE_LENGTH) {
      setError(`Informe o código de ${CODE_LENGTH} dígitos.`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // On success the user is signed in, and the root layout's guard swaps
      // the sign-up for the tabs.
      await confirmSignUp(email, code);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível confirmar o email.');
      setSubmitting(false);
    }
  }

  async function resend() {
    if (!email) return;
    setError(null);
    try {
      await resendSignUpCode(email);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível reenviar o código.');
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
            ? `Para entrar, confirme ${email} com o código de ${CODE_LENGTH} dígitos que enviamos no cadastro. Se ele expirou, peça um novo.`
            : `Enviamos um código de ${CODE_LENGTH} dígitos para ${email}. Ele vale por ${CODE_TTL_LABEL}.`
        }
        error={error}
        submitLabel="Confirmar"
        submitting={submitting}
        onSubmit={submit}>
        <CodeField
          code={code}
          onChangeCode={setCode}
          onSubmit={submit}
          onResend={resend}
          disabled={submitting}
          sent={sent !== '0'}
        />
      </StepScreen>
    </>
  );
}
