import { useChat } from '@/context/chat';
import { useCoaching } from '@/context/coaching';
import { useDashboardLayout } from '@/context/dashboard-layout';
import { useExerciseLog } from '@/context/exercise-log';
import { useFoodLog } from '@/context/food-log';
import { useTasks } from '@/context/tasks';
import { useWeightLog } from '@/context/weight-log';
import { useWorkoutPlan } from '@/context/workout-plan';

/**
 * Whether the signed-in account's data finished loading, across every data
 * context: `error` if any failed, `loading` while any is still loading.
 */
export function useUserDataStatus() {
  const stores = [
    useWeightLog(),
    useFoodLog(),
    useExerciseLog(),
    useWorkoutPlan(),
    useCoaching(),
    useChat(),
    useTasks(),
    useDashboardLayout(),
  ];
  const failed = stores.filter((store) => store.status === 'error');

  return {
    status:
      failed.length > 0
        ? ('error' as const)
        : stores.some((store) => store.status === 'loading' || store.status === 'idle')
          ? ('loading' as const)
          : ('ready' as const),
    retry: () => {
      for (const store of failed) store.retry();
    },
  };
}
