import { createContext, use, useState, type PropsWithChildren } from 'react';

import { useWorkoutPlan } from './workout-plan';

import { getPackage, packageWeek, type TrainingPackage } from '@/lib/trainers';
import { WEEKDAYS } from '@/lib/workouts';

type CoachingContextValue = {
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

type Joined = {
  packageId: string;
  /** Workouts that joining the package added to the plan. */
  workoutIds: string[];
};

/**
 * TEMPORARY: in-memory package the user joined until there is a backend.
 * Must sit inside `WorkoutPlanProvider`.
 */
export function CoachingProvider({ children }: PropsWithChildren) {
  const { importWorkouts, removeWorkout, setWeekday } = useWorkoutPlan();
  const [joined, setJoined] = useState<Joined | undefined>();

  function leavePackage() {
    for (const id of joined?.workoutIds ?? []) removeWorkout(id);
    setJoined(undefined);
  }

  function joinPackage(pkg: TrainingPackage) {
    const trainer = getPackage(pkg.id)?.trainer;
    if (joined?.packageId === pkg.id || !trainer) return;
    leavePackage();
    const ids = importWorkouts(pkg.workouts, { trainerId: trainer.id, packageId: pkg.id });
    const week = packageWeek(ids.length);
    for (const day of WEEKDAYS) {
      const index = week[day];
      setWeekday(day, index === undefined ? undefined : ids[index]);
    }
    setJoined({ packageId: pkg.id, workoutIds: ids });
  }

  return (
    <CoachingContext
      value={{
        joinedPackageId: joined?.packageId,
        isJoined: (packageId) => joined?.packageId === packageId,
        joinPackage,
        leavePackage,
      }}>
      {children}
    </CoachingContext>
  );
}
