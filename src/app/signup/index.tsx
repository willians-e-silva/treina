import { router, Stack } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, type TextInputInstance } from 'react-native';

import { StepScreen } from '@/components/signup/step-screen';
import { FormField } from '@/components/ui/form-field';
import { Brand, Spacing } from '@/constants/theme';
import { useSignup } from '@/context/signup';
import { EMAIL_PATTERN } from '@/lib/profile';

/** Step 1: name, email and password. */
export default function SignupAccountScreen() {
  const { account, setAccount } = useSignup();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  const [name, setName] = useState(account?.name ?? '');
  const [email, setEmail] = useState(account?.email ?? '');
  const [password, setPassword] = useState(account?.password ?? '');
  const [error, setError] = useState<string | null>(null);

  function next() {
    const trimmedName = name.trim().replace(/\s+/g, ' ');
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedName.split(' ').length < 2) {
      setError('Informe seu nome completo.');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Informe um email válido.');
      return;
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
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
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              hitSlop={Spacing.two}
              style={({ pressed }) => pressed && styles.pressed}>
              <ChevronLeft color={Brand.primary} size={24} />
            </Pressable>
          ),
        }}
      />
      <StepScreen
        step={1}
        steps={2}
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
        <FormField
          ref={passwordRef}
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Pelo menos 6 caracteres"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={next}
        />
      </StepScreen>
    </>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.5,
  },
});
