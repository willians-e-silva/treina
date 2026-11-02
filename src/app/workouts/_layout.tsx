import { Stack } from 'expo-router';

import { HeaderBackButton } from '@/components/ui/header-back-button';
import { useTopAppBarOptions } from '@/theme/navigation';

/** Modal flow to plan workouts: plan → workout. */
export default function WorkoutsLayout() {
  return (
    <Stack screenOptions={useTopAppBarOptions()}>
      <Stack.Screen
        name="index"
        options={{ title: 'Planejamento', headerLeft: () => <HeaderBackButton /> }}
      />
      <Stack.Screen name="[id]" options={{ title: 'Treino' }} />
    </Stack>
  );
}
