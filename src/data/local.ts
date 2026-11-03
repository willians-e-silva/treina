import type { CoachingMembership, Repositories } from './types';

import type { ChatThreads } from '@/lib/chat';
import { DEFAULT_DASHBOARD, type DashboardRows } from '@/lib/dashboard-widgets';
import type { ExerciseEntry } from '@/lib/exercises';
import { DEFAULT_MEALS, type FoodEntry, type Meal } from '@/lib/foods';
import type { Task } from '@/lib/tasks';
import { TRAINERS } from '@/lib/trainers';
import { upsertWeighIn, type WeighIn } from '@/lib/weight';
import { EMPTY_PLAN, type Workout, type WorkoutCompletion, type WorkoutPlan } from '@/lib/workouts';

type UserData = {
  weighIns: WeighIn[];
  goalKg: number | undefined;
  foodEntries: FoodEntry[];
  meals: Meal[];
  exerciseEntries: ExerciseEntry[];
  tasks: Task[];
  workouts: Workout[];
  plan: WorkoutPlan;
  completions: WorkoutCompletion[];
  dashboard: DashboardRows;
  membership: CoachingMembership | undefined;
  chat: ChatThreads;
};

function newUserData(): UserData {
  return {
    weighIns: [],
    goalKg: undefined,
    foodEntries: [],
    meals: [...DEFAULT_MEALS],
    exerciseEntries: [],
    tasks: [],
    workouts: [],
    plan: EMPTY_PLAN,
    completions: [],
    dashboard: DEFAULT_DASHBOARD,
    membership: undefined,
    chat: {},
  };
}

/**
 * Data of each account in memory, so signing in again with the same account
 * in this run shows its data and another account starts empty. Everything is
 * lost when the app restarts.
 */
const users = new Map<string, UserData>();
const cache = new Map<string, Repositories>();

/** In-memory repositories of one account (`EXPO_PUBLIC_DATA_SOURCE=local`). */
export function localRepositories(userId: string): Repositories {
  const cached = cache.get(userId);
  if (cached) return cached;

  let user = users.get(userId);
  if (!user) {
    user = newUserData();
    users.set(userId, user);
  }
  const data = user;

  const repositories: Repositories = {
    weight: {
      async load() {
        return { entries: data.weighIns, goalKg: data.goalKg };
      },
      async saveWeighIn(weighIn) {
        data.weighIns = upsertWeighIn(data.weighIns, weighIn);
      },
      async setGoal(kg) {
        data.goalKg = kg;
      },
    },
    foodLog: {
      async load() {
        return { entries: data.foodEntries, meals: data.meals };
      },
      async addEntry(entry) {
        data.foodEntries = [...data.foodEntries, entry];
      },
      async removeEntry(id) {
        data.foodEntries = data.foodEntries.filter((entry) => entry.id !== id);
      },
      async saveMeals(meals) {
        data.meals = meals;
      },
    },
    exerciseLog: {
      async list() {
        return data.exerciseEntries;
      },
      async add(entry) {
        data.exerciseEntries = [...data.exerciseEntries, entry];
      },
      async remove(id) {
        data.exerciseEntries = data.exerciseEntries.filter((entry) => entry.id !== id);
      },
    },
    tasks: {
      async list() {
        return data.tasks;
      },
      async add(task) {
        data.tasks = [...data.tasks, task];
      },
      async update(task) {
        data.tasks = data.tasks.map((other) => (other.id === task.id ? task : other));
      },
      async remove(id) {
        data.tasks = data.tasks.filter((task) => task.id !== id);
      },
    },
    workoutPlan: {
      async load() {
        return { workouts: data.workouts, plan: data.plan, completions: data.completions };
      },
      async saveWorkouts(workouts) {
        const saved = new Map(workouts.map((workout) => [workout.id, workout]));
        data.workouts = [
          ...data.workouts.map((workout) => saved.get(workout.id) ?? workout),
          ...workouts.filter((workout) => !data.workouts.some((other) => other.id === workout.id)),
        ];
      },
      async removeWorkout(id) {
        data.workouts = data.workouts.filter((workout) => workout.id !== id);
      },
      async savePlan(plan) {
        data.plan = plan;
      },
      async saveCompletion(completion) {
        data.completions = [
          ...data.completions.filter((other) => other.date !== completion.date),
          completion,
        ];
      },
      async removeCompletion(date) {
        data.completions = data.completions.filter((completion) => completion.date !== date);
      },
    },
    dashboardLayout: {
      async load() {
        return data.dashboard;
      },
      async save(rows) {
        data.dashboard = rows;
      },
    },
    coaching: {
      async load() {
        return data.membership;
      },
      async save(membership) {
        data.membership = membership;
      },
    },
    catalog: {
      async load() {
        return TRAINERS;
      },
    },
    chat: {
      async load() {
        return data.chat;
      },
      async send(trainerId, message) {
        data.chat = { ...data.chat, [trainerId]: [...(data.chat[trainerId] ?? []), message] };
      },
    },
  };

  cache.set(userId, repositories);
  return repositories;
}
