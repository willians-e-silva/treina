import { Stack } from 'expo-router';
import { useEffect, useEffectEvent } from 'react';

import { useSession } from '@/context/session';
import { useTopAppBarOptions } from '@/theme/navigation';

/** Password recovery: email → code → new password, then back to the login. */
export default function ForgotPasswordLayout() {
  const { cancelPasswordReset } = useSession();
  const onLeave = useEffectEvent(() => cancelPasswordReset());

  // Leaving before the new password is set ends the reset the code started.
  useEffect(() => () => onLeave(), []);

  return <Stack screenOptions={{ ...useTopAppBarOptions(), title: 'Recuperar senha' }} />;
}
