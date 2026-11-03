import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';

import { StepScreen } from '@/components/signup/step-screen';
import { PasswordField } from '@/components/ui/password-field';
import { useSession } from '@/context/session';
import { AuthError, PASSWORD_MIN_LENGTH, validatePassword } from '@/lib/auth';

/** Step 3: the new password, then back to the login to sign in with it. */
export default function ForgotPasswordNewPasswordScreen() {
  const { resetPassword } = useSession();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const confirmRef = useRef<TextInputInstance>(null);

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reached without the previous steps, e.g. a reload on web.
  if (!email) return <Redirect href="/forgot-password" />;

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
      description={`Escolha uma senha com pelo menos ${PASSWORD_MIN_LENGTH} caracteres para ${email}.`}
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
