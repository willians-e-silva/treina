import { Stack } from 'expo-router';

import { useTopAppBarOptions } from '@/theme/navigation';

/** Modal flow to log an exercise: search → details. */
export default function LogExerciseLayout() {
  return (
    <Stack screenOptions={useTopAppBarOptions()}>
      <Stack.Screen name="index" options={{ title: 'Adicionar exercício' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhes' }} />
    </Stack>
  );
}
