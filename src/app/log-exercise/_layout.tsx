import { Stack } from 'expo-router';

/** Modal flow to log an exercise: search → details. */
export default function LogExerciseLayout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Adicionar exercício' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhes' }} />
    </Stack>
  );
}
