import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ChatProvider } from '@/context/chat';
import { CoachingProvider } from '@/context/coaching';
import { DashboardLayoutProvider } from '@/context/dashboard-layout';
import { ExerciseLogProvider } from '@/context/exercise-log';
import { FoodLogProvider } from '@/context/food-log';
import { SessionProvider, useSession } from '@/context/session';
import { TasksProvider } from '@/context/tasks';
import { WeightLogProvider } from '@/context/weight-log';
import { WorkoutPlanProvider } from '@/context/workout-plan';
import { useNavigationTheme, useTopAppBarOptions } from '@/theme/navigation';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    // Required by react-native-gesture-handler (used by the tab swipe).
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={useNavigationTheme()}>
        <SessionProvider>
          <WeightLogProvider>
            <FoodLogProvider>
              <ExerciseLogProvider>
                <WorkoutPlanProvider>
                  <CoachingProvider>
                    <ChatProvider>
                      <TasksProvider>
                        <DashboardLayoutProvider>
                          <RootNavigator />
                        </DashboardLayoutProvider>
                      </TasksProvider>
                    </ChatProvider>
                  </CoachingProvider>
                </WorkoutPlanProvider>
              </ExerciseLogProvider>
            </FoodLogProvider>
          </WeightLogProvider>
        </SessionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { session, restoring } = useSession();
  const topAppBar = useTopAppBarOptions();

  return (
    <>
      {/* Stays up while the saved session is read, so the login never flashes. */}
      <AnimatedSplashOverlay ready={!restoring} />
      {/* Modals that show a header (add-task, meals) get the M3 top app bar. */}
      <Stack screenOptions={{ ...topAppBar, headerShown: false }}>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="log-food" options={{ presentation: 'modal' }} />
          <Stack.Screen name="meals" options={{ presentation: 'modal' }} />
          <Stack.Screen name="log-exercise" options={{ presentation: 'modal' }} />
          <Stack.Screen name="workouts" options={{ presentation: 'modal' }} />
          <Stack.Screen name="workout-session" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="add-task" options={{ presentation: 'modal' }} />
          <Stack.Screen name="trainer" />
          <Stack.Screen name="chat/[trainerId]" />
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" />
        </Stack.Protected>

        {/* Opened by the link in the confirmation email, signed in or not. Last,
            so the guards above never fall back to it. */}
        <Stack.Screen name="auth/callback" />
      </Stack>
    </>
  );
}
