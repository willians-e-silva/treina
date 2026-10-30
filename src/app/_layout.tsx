import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { DashboardLayoutProvider } from '@/context/dashboard-layout';
import { ExerciseLogProvider } from '@/context/exercise-log';
import { FoodLogProvider } from '@/context/food-log';
import { SessionProvider, useSession } from '@/context/session';
import { TasksProvider } from '@/context/tasks';
import { useNavigationTheme, useTopAppBarOptions } from '@/theme/navigation';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    // Required by react-native-gesture-handler (used by the tab swipe).
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={useNavigationTheme()}>
        <SessionProvider>
          <FoodLogProvider>
            <ExerciseLogProvider>
              <TasksProvider>
                <DashboardLayoutProvider>
                  <AnimatedSplashOverlay />
                  <RootNavigator />
                </DashboardLayoutProvider>
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
  const topAppBar = useTopAppBarOptions();

  return (
    // Modals that show a header (add-task, meals) get the M3 top app bar.
    <Stack screenOptions={{ ...topAppBar, headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="log-food" options={{ presentation: 'modal' }} />
        <Stack.Screen name="meals" options={{ presentation: 'modal' }} />
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
