import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ExerciseLogProvider } from '@/context/exercise-log';
import { FoodLogProvider } from '@/context/food-log';
import { SessionProvider, useSession } from '@/context/session';
import { TasksProvider } from '@/context/tasks';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    // Required by react-native-gesture-handler (used by the tab swipe).
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SessionProvider>
          <FoodLogProvider>
            <ExerciseLogProvider>
              <TasksProvider>
                <AnimatedSplashOverlay />
                <RootNavigator />
              </TasksProvider>
            </ExerciseLogProvider>
          </FoodLogProvider>
        </SessionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { session } = useSession();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="log-food" options={{ presentation: 'modal' }} />
        <Stack.Screen name="log-exercise" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-task" options={{ presentation: 'modal' }} />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>
    </Stack>
  );
}
