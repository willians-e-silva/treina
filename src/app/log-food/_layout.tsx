import { Stack } from 'expo-router';

/** Modal flow to log a food: search → quantity. */
export default function LogFoodLayout() {
  return (
    // Opaque header: since SDK 58 it is transparent on iOS 26+ and the
    // screens would scroll under it.
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal', headerTransparent: false }}>
      <Stack.Screen name="index" options={{ title: 'Adicionar alimento' }} />
      <Stack.Screen name="[id]" options={{ title: 'Quantidade' }} />
    </Stack>
  );
}
