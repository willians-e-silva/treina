import { Stack } from 'expo-router';

import { SignupProvider } from '@/context/signup';

/** Sign-up flow: account → body data. */
export default function SignupLayout() {
  return (
    <SignupProvider>
      <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal', title: 'Criar conta' }} />
    </SignupProvider>
  );
}
