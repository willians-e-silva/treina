import { createContext, use, useState, type PropsWithChildren } from 'react';

import type {
  NewPlannedExercise,
  PlanMode,
  SessionSummary,
  Weekday,
  Workout,
  WorkoutCompletion,
  WorkoutPlan,
  WorkoutSource,
} from '@/lib/workouts';

type WorkoutPlanContextValue = {
  workouts: Workout[];
  plan: WorkoutPlan;
  completions: WorkoutCompletion[];
  /** Creates an empty workout and returns its id. */
  addWorkout: (name: string) => string;
  renameWorkout: (id: string, name: string) => void;
  /** Deletes the workout and takes it out of the week and the queue. */
  removeWorkout: (id: string) => void;
  /**
   * Adds ready-made workouts at the end of the queue and returns their ids,
   * in order. With a `source` (a trainer's package) they cannot be changed.
   */
  importWorkouts: (
    workouts: ImportedWorkout[],
    source?: WorkoutSource,
  ) => string[];
  addExercise: (workoutId: string, exercise: NewPlannedExercise) => void;
  removeExercise: (workoutId: string, exerciseId: string) => void;
  setMode: (mode: PlanMode) => void;
  /** Sets the workout of a day of the week; `undefined` makes it a rest day. */
  setWeekday: (day: Weekday, workoutId: string | undefined) => void;
  addToQueue: (workoutId: string) => void;
  removeFromQueue: (index: number) => void;
  /** Moves a queue item one place up (`-1`) or down (`1`). */
  moveInQueue: (index: number, direction: -1 | 1) => void;
  /** Makes the queue item at `index` the next workout. */
  setNextInQueue: (index: number) => void;
  /** Marks the workout done on `date`; in queue mode the queue moves on. */
  completeWorkout: (date: string, workoutId: string, session?: SessionSummary) => void;
  /** Undoes `completeWorkout` for `date`; in queue mode the queue moves back. */
  undoCompletion: (date: string) => void;
};

/** A ready-made workout, before it gets its ids. */
type ImportedWorkout = Pick<Workout, 'name' | 'summary' | 'description'> & {
  exercises: NewPlannedExercise[];
};

const WorkoutPlanContext = createContext<WorkoutPlanContextValue | null>(null);

export function useWorkoutPlan() {
  const value = use(WorkoutPlanContext);
  if (!value) {
    throw new Error('useWorkoutPlan must be wrapped in a <WorkoutPlanProvider />');
  }
  return value;
}

let nextId = 0;
function createId() {
  nextId += 1;
  return `${Date.now()}-${nextId}`;
}

const EMPTY_PLAN: WorkoutPlan = { mode: 'weekly', weekly: {}, queue: [], queueIndex: 0 };

/**
 * TEMPORARY: in-memory plan until there is a backend. Workouts and the plan
 * are lost when the app restarts.
 */
export function WorkoutPlanProvider({ children }: PropsWithChildren) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [plan, setPlan] = useState<WorkoutPlan>(EMPTY_PLAN);
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);

  function updateWorkout(id: string, update: (workout: Workout) => Workout) {
    // A trainer's workout stays as published.
    setWorkouts((current) =>
      current.map((workout) => (workout.id === id && !workout.source ? update(workout) : workout)),
    );
  }

  function addWorkout(name: string) {
    const id = createId();
    setWorkouts((current) => [...current, { id, name: name.trim(), exercises: [] }]);
    return id;
  }

  function renameWorkout(id: string, name: string) {
    updateWorkout(id, (workout) => ({ ...workout, name: name.trim() }));
  }

  function removeWorkout(id: string) {
    setWorkouts((current) => current.filter((workout) => workout.id !== id));
    setPlan((current) => {
      const weekly = Object.fromEntries(
        Object.entries(current.weekly).filter(([, workoutId]) => workoutId !== id),
      );
      const before = current.queue.slice(0, current.queueIndex).filter((item) => item !== id);
      const queue = current.queue.filter((item) => item !== id);
      return {
        ...current,
        weekly,
        queue,
        queueIndex: queue.length === 0 ? 0 : before.length % queue.length,
      };
    });
  }

  function importWorkouts(imported: ImportedWorkout[], source?: WorkoutSource) {
    const added: Workout[] = imported.map(({ name, summary, description, exercises }) => ({
      id: createId(),
      name,
      summary,
      description,
      exercises: exercises.map((exercise) => ({ ...exercise, id: createId() })),
      source,
    }));
    const ids = added.map((workout) => workout.id);
    setWorkouts((current) => [...current, ...added]);
    setPlan((current) => ({ ...current, queue: [...current.queue, ...ids] }));
    return ids;
  }

  function addExercise(workoutId: string, exercise: NewPlannedExercise) {
    updateWorkout(workoutId, (workout) => ({
      ...workout,
      exercises: [...workout.exercises, { ...exercise, id: createId() }],
    }));
  }

  function removeExercise(workoutId: string, exerciseId: string) {
    updateWorkout(workoutId, (workout) => ({
      ...workout,
      exercises: workout.exercises.filter((exercise) => exercise.id !== exerciseId),
    }));
  }

  function setMode(mode: PlanMode) {
    setPlan((current) => ({ ...current, mode }));
  }

  function setWeekday(day: Weekday, workoutId: string | undefined) {
    setPlan((current) => {
      const weekly = { ...current.weekly };
      if (workoutId) weekly[day] = workoutId;
      else delete weekly[day];
      return { ...current, weekly };
    });
  }

  function addToQueue(workoutId: string) {
    setPlan((current) => ({ ...current, queue: [...current.queue, workoutId] }));
  }

  function removeFromQueue(index: number) {
    setPlan((current) => {
      const queue = current.queue.filter((_, i) => i !== index);
      // Items before the next one shift it down; removing the next one keeps
      // the index, which then points at the item that followed it.
      const shifted = index < current.queueIndex ? current.queueIndex - 1 : current.queueIndex;
      return { ...current, queue, queueIndex: queue.length === 0 ? 0 : shifted % queue.length };
    });
  }

  function moveInQueue(index: number, direction: -1 | 1) {
    setPlan((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.queue.length) return current;
      const queue = [...current.queue];
      [queue[index], queue[target]] = [queue[target], queue[index]];
      // The next workout stays the same item even though it moved.
      const queueIndex =
        current.queueIndex === index
          ? target
          : current.queueIndex === target
            ? index
            : current.queueIndex;
      return { ...current, queue, queueIndex };
    });
  }

  function setNextInQueue(index: number) {
    setPlan((current) => ({ ...current, queueIndex: index }));
  }

  function completeWorkout(date: string, workoutId: string, session?: SessionSummary) {
    setCompletions((current) => [
      ...current.filter((completion) => completion.date !== date),
      { date, workoutId, session },
    ]);
    setPlan((current) =>
      current.mode === 'queue' && current.queue.length > 0
        ? { ...current, queueIndex: (current.queueIndex + 1) % current.queue.length }
        : current,
    );
  }

  function undoCompletion(date: string) {
    setCompletions((current) => current.filter((completion) => completion.date !== date));
    setPlan((current) =>
      current.mode === 'queue' && current.queue.length > 0
        ? {
            ...current,
            queueIndex: (current.queueIndex - 1 + current.queue.length) % current.queue.length,
          }
        : current,
    );
  }

  return (
    <WorkoutPlanContext
      value={{
        workouts,
        plan,
        completions,
        addWorkout,
        renameWorkout,
        removeWorkout,
        importWorkouts,
        addExercise,
        removeExercise,
        setMode,
        setWeekday,
        addToQueue,
        removeFromQueue,
        moveInQueue,
        setNextInQueue,
        completeWorkout,
        undoCompletion,
      }}>
      {children}
    </WorkoutPlanContext>
  );
}
