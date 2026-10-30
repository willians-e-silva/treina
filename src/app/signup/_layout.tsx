import { Stack } from 'expo-router';

import { SignupProvider } from '@/context/signup';

/** Sign-up flow: account → body data. */
export default function SignupLayout() {
  return (
    <SignupProvider>
      {/* Opaque header: since SDK 58 it is transparent on iOS 26+. */}
      <Stack
        screenOptions={{
          headerBackButtonDisplayMode: 'minimal',
          headerTransparent: false,
          title: 'Criar conta',
        }}
      />
    </SignupProvider>
  );
}
