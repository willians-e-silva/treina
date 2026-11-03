import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';

import { StepScreen } from '@/components/signup/step-screen';
import { PasswordField } from '@/components/ui/password-field';
import { useSession } from '@/context/session';
import { AuthError, linkErrorMessage, PASSWORD_MIN_LENGTH, validatePassword } from '@/lib/auth';

type LinkState =
  | { status: 'opening' }
  | { status: 'ready'; email: string }
  | { status: 'invalid'; message: string };

/**
 * Step 3, opened by the link in the reset email
 * (`treina://forgot-password/new-password?code=…`): the new password, then
 * back to the login to sign in with it.
 */
export default function ForgotPasswordNewPasswordScreen() {
  const { startPasswordReset, resetPassword } = useSession();
  const params = useLocalSearchParams<{
    code?: string;
    sb_flow_id?: string;
    error_code?: string;
  }>();
  const confirmRef = useRef<TextInputInstance>(null);

  const [link, setLink] = useState<LinkState>(() =>
    params.code
      ? { status: 'opening' }
      : { status: 'invalid', message: linkErrorMessage(params.error_code) },
  );
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { code, sb_flow_id: flowId } = params;
  const open = useEffectEvent((link: { code: string; flowId?: string }) =>
    startPasswordReset(link),
  );
  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    open({ code, flowId }).then(
      (email) => {
        if (!cancelled) setLink({ status: 'ready', email });
      },
      (e: unknown) => {
        if (cancelled) return;
        setLink({
          status: 'invalid',
          message: e instanceof AuthError ? e.message : linkErrorMessage(undefined),
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [code, flowId]);

  if (link.status !== 'ready') {
    return (
      <StepScreen
        step={3}
        steps={3}
        title={link.status === 'opening' ? 'Crie uma nova senha' : 'Link inválido'}
        description={
          link.status === 'opening'
            ? 'Conferindo o link do email…'
            : 'Peça um novo link para redefinir a senha.'
        }
        error={link.status === 'invalid' ? link.message : null}
        submitLabel="Pedir novo link"
        submitting={link.status === 'opening'}
        onSubmit={() => router.replace('/forgot-password')}
      />
    );
  }

  async function submit() {
    const invalid = validatePassword(password);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (confirmation !== password) {
      setError('As senhas não coincidem.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(password);
      // The login shows that the password changed, with the email filled in.
      router.dismissTo('/login');
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível alterar a senha.');
      setSubmitting(false);
    }
  }

  return (
    <StepScreen
      step={3}
      steps={3}
      title="Crie uma nova senha"
      description={`Escolha uma senha com pelo menos ${PASSWORD_MIN_LENGTH} caracteres para ${link.email}.`}
      error={error}
      submitLabel="Alterar senha"
      submitting={submitting}
      onSubmit={submit}>
      <PasswordField
        label="Nova senha"
        value={password}
        onChangeText={setPassword}
        placeholder={`Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => confirmRef.current?.focus()}
        editable={!submitting}
        autoFocus
      />
      <PasswordField
        ref={confirmRef}
        label="Confirmar nova senha"
        value={confirmation}
        onChangeText={setConfirmation}
        placeholder="Repita a nova senha"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={submit}
        editable={!submitting}
      />
    </StepScreen>
  );
}
