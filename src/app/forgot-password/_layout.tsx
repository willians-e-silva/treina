import { Stack } from 'expo-router';

import { useTopAppBarOptions } from '@/theme/navigation';

/** Password recovery: email → code → new password, then back to the login. */
export default function ForgotPasswordLayout() {
  return <Stack screenOptions={{ ...useTopAppBarOptions(), title: 'Recuperar senha' }} />;
}
