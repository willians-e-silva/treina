import { Stack } from 'expo-router';

/** Modal flow to log an exercise: search → details. */
export default function LogExerciseLayout() {
  return (
    // Opaque header: since SDK 58 it is transparent on iOS 26+ and the
    // screens would scroll under it.
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal', headerTransparent: false }}>
      <Stack.Screen name="index" options={{ title: 'Adicionar exercício' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhes' }} />
    </Stack>
  );
}
