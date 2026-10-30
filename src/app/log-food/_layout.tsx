import { Stack } from 'expo-router';

import { useTopAppBarOptions } from '@/theme/navigation';

/** Modal flow to log a food: search → quantity. */
export default function LogFoodLayout() {
  return (
    <Stack screenOptions={useTopAppBarOptions()}>
      <Stack.Screen name="index" options={{ title: 'Adicionar alimento' }} />
      <Stack.Screen name="[id]" options={{ title: 'Quantidade' }} />
    </Stack>
  );
}
