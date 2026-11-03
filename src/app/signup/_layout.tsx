import { Stack } from 'expo-router';

import { SignupProvider } from '@/context/signup';
import { useTopAppBarOptions } from '@/theme/navigation';

/** Sign-up flow: account → body data → email confirmation. */
export default function SignupLayout() {
  return (
    <SignupProvider>
      <Stack screenOptions={{ ...useTopAppBarOptions(), title: 'Criar conta' }} />
    </SignupProvider>
  );
}
