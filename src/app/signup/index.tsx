import { router, Stack } from 'expo-router';
import { useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';

import { HeaderBackButton } from '@/components/ui/header-back-button';
import { StepScreen } from '@/components/signup/step-screen';
import { FormField } from '@/components/ui/form-field';
import { PasswordField } from '@/components/ui/password-field';
import { useSignup } from '@/context/signup';
import { normalizeEmail, PASSWORD_MIN_LENGTH, validatePassword } from '@/lib/auth';
import { EMAIL_PATTERN } from '@/lib/profile';

/** Step 1: name, email and password. */
export default function SignupAccountScreen() {
  const { account, setAccount } = useSignup();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const [name, setName] = useState(account?.name ?? '');
  const [email, setEmail] = useState(account?.email ?? '');
  const [password, setPassword] = useState(account?.password ?? '');
  const [confirmation, setConfirmation] = useState(account?.password ?? '');
  const [error, setError] = useState<string | null>(null);

  function next() {
    const trimmedName = name.trim().replace(/\s+/g, ' ');
    const trimmedEmail = normalizeEmail(email);
    if (trimmedName.split(' ').length < 2) {
      setError('Informe seu nome completo.');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Informe um email válido.');
      return;
    }
    const invalidPassword = validatePassword(password);
    if (invalidPassword) {
      setError(invalidPassword);
      return;
    }
    if (confirmation !== password) {
      setError('As senhas não coincidem.');
      return;
    }
    setError(null);
    setAccount({ name: trimmedName, email: trimmedEmail, password });
    router.push('/signup/details');
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
        title="Sua conta"
        description="Comece com seus dados de acesso."
        error={error}
        submitLabel="Continuar"
        onSubmit={next}>
        <FormField
          label="Nome completo"
          value={name}
          onChangeText={setName}
          placeholder="Maria Silva"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
          autoFocus
        />
        <FormField
          ref={emailRef}
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@exemplo.com"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <PasswordField
          ref={passwordRef}
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder={`Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <PasswordField
          ref={confirmRef}
          label="Confirmar senha"
          value={confirmation}
          onChangeText={setConfirmation}
          placeholder="Repita a senha"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={next}
        />
      </StepScreen>
    </>
  );
}
