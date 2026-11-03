import type { Repositories } from '../types';
import { catalogRepository } from './catalog';
import { chatRepository } from './chat';
import { coachingRepository } from './coaching';
import { dashboardLayoutRepository } from './dashboard-layout';
import { exerciseLogRepository } from './exercise-log';
import { foodLogRepository } from './food-log';
import { tasksRepository } from './tasks';
import { weightRepository } from './weight';
import { workoutPlanRepository } from './workout-plan';

/**
 * Repositories of the signed-in account in Supabase
 * (`EXPO_PUBLIC_DATA_SOURCE=supabase`). Row Level Security limits every query
 * to the account's own rows; the `user_id` filters also let Postgres use the
 * indexes.
 */
export function supabaseRepositories(userId: string): Repositories {
  return {
    weight: weightRepository(userId),
    foodLog: foodLogRepository(userId),
    exerciseLog: exerciseLogRepository(userId),
    tasks: tasksRepository(userId),
    workoutPlan: workoutPlanRepository(userId),
    dashboardLayout: dashboardLayoutRepository(userId),
    coaching: coachingRepository(userId),
    chat: chatRepository(userId),
    catalog: catalogRepository,
  };
}
