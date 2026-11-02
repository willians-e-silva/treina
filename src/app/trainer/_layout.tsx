import { Stack } from 'expo-router';

import { HeaderBackButton } from '@/components/ui/header-back-button';
import { useTopAppBarOptions } from '@/theme/navigation';

/** Trainer flow opened from the Treinador tab: profile → package → workout. */
export default function TrainerLayout() {
  return (
    <Stack screenOptions={useTopAppBarOptions()}>
      <Stack.Screen
        name="[id]"
        options={{ title: 'Treinador', headerLeft: () => <HeaderBackButton /> }}
      />
      <Stack.Screen name="package/[id]" options={{ title: 'Pacote de treinos' }} />
      <Stack.Screen name="workout" options={{ title: 'Treino' }} />
    </Stack>
  );
}
