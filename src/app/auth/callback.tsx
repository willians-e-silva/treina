import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useEffectEvent, useState } from 'react';

import { StepScreen } from '@/components/signup/step-screen';
import { useSession } from '@/context/session';
import { AuthError, linkErrorMessage } from '@/lib/auth';

/**
 * Opened by the link in the confirmation email (`treina://auth/callback?code=…`):
 * signs the new account in. The email is confirmed as soon as the link is
 * opened, so when the app cannot sign in (e.g. the link was opened on another
 * device) the user can still sign in with the password.
 */
export default function AuthCallbackScreen() {
  const { completeEmailLink, session } = useSession();
  const params = useLocalSearchParams<{
    code?: string;
    sb_flow_id?: string;
    error_code?: string;
  }>();
  const [error, setError] = useState<string | null>(() =>
    params.code ? null : linkErrorMessage(params.error_code),
  );

  const { code, sb_flow_id: flowId } = params;
  const open = useEffectEvent((link: { code: string; flowId?: string }) => completeEmailLink(link));
  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    open({ code, flowId }).catch((e: unknown) => {
      if (cancelled) return;
      setError(
        e instanceof AuthError
          ? `${e.message} Se o email já foi confirmado, entre com sua senha.`
          : linkErrorMessage(undefined),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [code, flowId]);

  // Signed in: the tabs show their loading state while the profile loads.
  useEffect(() => {
    if (session) router.replace('/');
  }, [session]);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Confirmar email' }} />
      <StepScreen
        step={3}
        steps={3}
        title={error ? 'Não foi possível entrar' : 'Confirmando seu email'}
        description={error ? 'Volte para o login para entrar na sua conta.' : 'Só um instante…'}
        error={error}
        submitLabel="Ir para o login"
        submitting={!error}
        onSubmit={() => router.replace('/login')}
      />
    </>
  );
}
