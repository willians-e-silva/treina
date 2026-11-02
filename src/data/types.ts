import type { ChatMessage, ChatThreads } from '@/lib/chat';
import type { DashboardRows } from '@/lib/dashboard-widgets';
import type { ExerciseEntry } from '@/lib/exercises';
import type { FoodEntry, Meal } from '@/lib/foods';
import type { Task } from '@/lib/tasks';
import type { WeighIn } from '@/lib/weight';
import type { Workout, WorkoutCompletion, WorkoutPlan } from '@/lib/workouts';

/*
 * One repository per domain, always for the signed-in user. Contexts keep what
 * is on screen and call these to load it and save each change; the rules
 * (meal order, task repetition, the queue) stay in `src/lib` and run in the
 * app, so a repository only stores what it is given. Ids are created in the
 * app too, so a change can be shown before it is saved.
 */

export type WeightLogData = {
  /** Oldest first; at most one per day. */
  entries: WeighIn[];
  goalKg: number | undefined;
};

export interface WeightRepository {
  load(): Promise<WeightLogData>;
  /** Replaces the weigh-in of the same day, if any. */
  saveWeighIn(weighIn: WeighIn): Promise<void>;
  /** `undefined` removes the goal. */
  setGoal(kg: number | undefined): Promise<void>;
}

export type FoodLogData = {
  entries: FoodEntry[];
  /** Meals shown in the diary, in order. */
  meals: Meal[];
};

export interface FoodLogRepository {
  load(): Promise<FoodLogData>;
  addEntry(entry: FoodEntry): Promise<void>;
  removeEntry(id: string): Promise<void>;
  /** Adds the meal at its place among the diary's meals. */
  addMeal(meal: Meal): Promise<void>;
  removeMeal(id: string): Promise<void>;
}

export interface ExerciseLogRepository {
  list(): Promise<ExerciseEntry[]>;
  add(entry: ExerciseEntry): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface TasksRepository {
  list(): Promise<Task[]>;
  add(task: Task): Promise<void>;
  /** Saves the whole task: fields, subtasks and done dates. */
  update(task: Task): Promise<void>;
  remove(id: string): Promise<void>;
}

export type WorkoutPlanData = {
  workouts: Workout[];
  plan: WorkoutPlan;
  completions: WorkoutCompletion[];
};

export interface WorkoutPlanRepository {
  load(): Promise<WorkoutPlanData>;
  /** Creates or replaces the workout, with its exercises. */
  saveWorkouts(workouts: Workout[]): Promise<void>;
  removeWorkout(id: string): Promise<void>;
  savePlan(plan: WorkoutPlan): Promise<void>;
  /** Replaces the completion of the same day, if any. */
  saveCompletion(completion: WorkoutCompletion): Promise<void>;
  removeCompletion(date: string): Promise<void>;
}

export interface DashboardLayoutRepository {
  load(): Promise<DashboardRows>;
  save(rows: DashboardRows): Promise<void>;
}

/** The trainer's package the user follows. */
export type CoachingMembership = {
  packageId: string;
  /** Workouts that joining the package added to the plan. */
  workoutIds: string[];
};

export interface CoachingRepository {
  load(): Promise<CoachingMembership | undefined>;
  /** `undefined`: the user follows no package. */
  save(membership: CoachingMembership | undefined): Promise<void>;
}

export interface ChatRepository {
  load(): Promise<ChatThreads>;
  send(trainerId: string, message: ChatMessage): Promise<void>;
}

export type Repositories = {
  weight: WeightRepository;
  foodLog: FoodLogRepository;
  exerciseLog: ExerciseLogRepository;
  tasks: TasksRepository;
  workoutPlan: WorkoutPlanRepository;
  dashboardLayout: DashboardLayoutRepository;
  coaching: CoachingRepository;
  chat: ChatRepository;
};
