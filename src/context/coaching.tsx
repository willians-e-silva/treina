import { createContext, use, type PropsWithChildren } from 'react';

import { useSession } from './session';
import { useWorkoutPlan } from './workout-plan';

import type { CoachingMembership, Repositories } from '@/data/types';
import { useUserStore, type StoreStatus } from '@/data/use-user-store';
import { getPackage, packageWeek, type TrainingPackage } from '@/lib/trainers';
import { WEEKDAYS } from '@/lib/workouts';

type CoachingContextValue = {
  status: StoreStatus;
  retry: () => void;
  /** Id of the package the user follows; only one at a time. */
  joinedPackageId: string | undefined;
  isJoined: (packageId: string) => boolean;
  /**
   * Copies the package's workouts into the plan: at the end of the queue and
   * spread over the week, which replaces the days set before. The package
   * followed until then is left first.
   */
  joinPackage: (pkg: TrainingPackage) => void;
  /** Removes the workouts that joining the package added to the plan. */
  leavePackage: () => void;
};

const CoachingContext = createContext<CoachingContextValue | null>(null);

export function useCoaching() {
  const value = use(CoachingContext);
  if (!value) {
    throw new Error('useCoaching must be wrapped in a <CoachingProvider />');
  }
  return value;
}

const load = (repositories: Repositories) => repositories.coaching.load();

/**
 * Package the signed-in account follows. Must sit inside `SessionProvider`
 * and `WorkoutPlanProvider`.
 */
export function CoachingProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const { importWorkouts, removeWorkout, setWeekday } = useWorkoutPlan();
  const store = useUserStore<CoachingMembership | undefined>(session, undefined, load);

  function save(membership: CoachingMembership | undefined) {
    store.update(() => membership);
    store.write((repositories) => repositories.coaching.save(membership));
  }

  function leavePackage() {
    for (const id of store.data?.workoutIds ?? []) removeWorkout(id);
    save(undefined);
  }

  function joinPackage(pkg: TrainingPackage) {
    const trainer = getPackage(pkg.id)?.trainer;
    if (store.data?.packageId === pkg.id || !trainer) return;
    leavePackage();
    const ids = importWorkouts(pkg.workouts, { trainerId: trainer.id, packageId: pkg.id });
    const week = packageWeek(ids.length);
    for (const day of WEEKDAYS) {
      const index = week[day];
      setWeekday(day, index === undefined ? undefined : ids[index]);
    }
    save({ packageId: pkg.id, workoutIds: ids });
  }

  return (
    <CoachingContext
      value={{
        status: store.status,
        retry: store.retry,
        joinedPackageId: store.data?.packageId,
        isJoined: (packageId) => store.data?.packageId === packageId,
        joinPackage,
        leavePackage,
      }}>
      {children}
    </CoachingContext>
  );
}
