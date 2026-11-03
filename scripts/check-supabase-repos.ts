/**
 * Runs the app's Supabase repositories (src/data/supabase) against the
 * project: saves one change of every kind signed in as a test account, reads
 * everything back from a second client signed in separately (as another
 * device would), checks it matches, and undoes what it can.
 *
 * Use an account made only for this: it replaces the account's goal, plan
 * and dashboard while it runs, and leaves a weigh-in and a chat message
 * (neither can be deleted from the app).
 *
 *   set -a; . ./.env.local; set +a
 *   TREINA_TEST_EMAIL=… TREINA_TEST_PASSWORD=… \
 *     npx tsx --tsconfig scripts/check/tsconfig.json scripts/check-supabase-repos.ts
 */
import assert from 'node:assert/strict';

import { newClient, useClient } from './check/supabase-node';

import { createId } from '../src/data/ids';
import { supabaseRepositories } from '../src/data/supabase';
import { DEFAULT_DASHBOARD } from '../src/lib/dashboard-widgets';
import type { ExerciseEntry } from '../src/lib/exercises';
import { DEFAULT_MEALS, type FoodEntry } from '../src/lib/foods';
import type { Task } from '../src/lib/tasks';
import { EMPTY_PLAN, type Workout, type WorkoutPlan } from '../src/lib/workouts';

async function signIn() {
  const email = process.env.TREINA_TEST_EMAIL;
  const password = process.env.TREINA_TEST_PASSWORD;
  if (!email || !password) throw new Error('Set TREINA_TEST_EMAIL and TREINA_TEST_PASSWORD.');
  const client = newClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  useClient(client);
  return data.user.id;
}

function step(name: string) {
  console.log(`✓ ${name}`);
}

async function main() {
  const userId = await signIn();
  const repos = supabaseRepositories(userId);
  const today = new Date().toISOString().slice(0, 10);

  const trainers = await repos.catalog.load();
  assert.ok(trainers.length > 0, 'the catalog is empty');
  const trainer = trainers[0];
  const pkg = trainer.packages[0];
  step(`catalog: ${trainers.length} trainers`);

  // --- Device A: one change of each kind -----------------------------------
  await repos.weight.saveWeighIn({ date: today, kg: 80.5 });
  await repos.weight.setGoal(75);

  const meals = [...DEFAULT_MEALS, { id: `custom-${createId()}`, name: 'Ceia de teste' }];
  await repos.foodLog.saveMeals(meals);
  const food: FoodEntry = {
    id: createId(),
    date: today,
    meal: 'lunch',
    mealName: 'Almoço',
    foodId: 'taco:1',
    source: 'taco',
    name: 'Arroz (teste)',
    grams: 150,
    nutrients: { kcal: 192, carbs: 42.3, protein: 3.8, fat: 0.3 },
  };
  await repos.foodLog.addEntry(food);

  const task: Task = {
    id: createId(),
    title: 'Tarefa de teste',
    repeat: { kind: 'every', interval: 2, unit: 'day' },
    startDate: today,
    doneDates: [],
    subtasks: [
      { id: createId(), title: 'Passo 1', doneDates: [today] },
      { id: createId(), title: 'Passo 2', doneDates: [] },
    ],
  };
  await repos.tasks.add(task);
  const updatedTask: Task = { ...task, subtasks: [task.subtasks[0]], doneDates: [today] };
  await repos.tasks.update(updatedTask);

  const own: Workout = {
    id: createId(),
    name: 'Treino de teste',
    exercises: [
      { id: createId(), name: 'Supino', category: 'strength', sets: 4, reps: 10, weightKg: 20 },
      { id: createId(), name: 'Esteira', category: 'cardio', minutes: 15, met: 8 },
    ],
  };
  const fromPackage: Workout = {
    id: createId(),
    name: pkg.workouts[0].name,
    summary: pkg.workouts[0].summary,
    description: pkg.workouts[0].description,
    exercises: pkg.workouts[0].exercises.map((exercise) => ({ ...exercise, id: createId() })),
    source: { trainerId: trainer.id, packageId: pkg.id },
  };
  await repos.workoutPlan.saveWorkouts([own]);
  await repos.workoutPlan.saveWorkouts([fromPackage]);
  const plan: WorkoutPlan = {
    mode: 'queue',
    weekly: { 1: own.id, 3: fromPackage.id },
    queue: [own.id, fromPackage.id, own.id],
    queueIndex: 1,
  };
  await repos.workoutPlan.savePlan(plan);
  const completion = {
    date: today,
    workoutId: own.id,
    session: { durationSeconds: 1800, feeling: 4 as const },
  };
  await repos.workoutPlan.saveCompletion(completion);
  await repos.coaching.save({ packageId: pkg.id, workoutIds: [fromPackage.id] });

  const exercise: ExerciseEntry = {
    id: createId(),
    date: today,
    name: 'Supino',
    category: 'strength',
    sets: 4,
    reps: 10,
    weightKg: 20,
    plannedId: own.exercises[0].id,
  };
  await repos.exerciseLog.add(exercise);

  const rows = [['weight'], ['calories', 'macros']] as typeof DEFAULT_DASHBOARD;
  await repos.dashboardLayout.save(rows);

  const message = { id: createId(), from: 'me' as const, text: 'Olá (teste)', sentAt: Date.now() };
  await repos.chat.send(trainer.id, message);
  step('device A saved one change of each kind');

  // --- Device B: a separate sign-in reads it all back -----------------------
  const otherId = await signIn();
  assert.equal(otherId, userId);
  const other = supabaseRepositories(otherId);

  const weight = await other.weight.load();
  assert.deepEqual(weight.entries.at(-1), { date: today, kg: 80.5 });
  assert.equal(weight.goalKg, 75);
  step('weight and goal');

  const foodLog = await other.foodLog.load();
  assert.deepEqual(foodLog.meals, meals);
  assert.deepEqual(
    foodLog.entries.find((entry) => entry.id === food.id),
    { ...food, detail: undefined, nutrients: { ...food.nutrients, fiber: undefined } },
  );
  step('food diary and meals');

  const tasks = await other.tasks.list();
  assert.deepEqual(
    tasks.find((candidate) => candidate.id === task.id),
    updatedTask,
  );
  step('tasks and subtasks');

  const workoutPlan = await other.workoutPlan.load();
  assert.deepEqual(
    workoutPlan.workouts.find((workout) => workout.id === own.id),
    { ...own, summary: undefined, description: undefined, source: undefined, exercises: own.exercises.map((e) => ({ met: undefined, note: undefined, ...e })) },
  );
  const copied = workoutPlan.workouts.find((workout) => workout.id === fromPackage.id);
  assert.deepEqual(copied?.source, fromPackage.source);
  assert.equal(copied?.exercises.length, fromPackage.exercises.length);
  assert.deepEqual(workoutPlan.plan, plan);
  assert.deepEqual(
    workoutPlan.completions.find((candidate) => candidate.date === today),
    completion,
  );
  step('workouts, plan and completed day');

  assert.deepEqual(await other.coaching.load(), { packageId: pkg.id, workoutIds: [fromPackage.id] });
  step('package followed');

  assert.deepEqual(
    (await other.exerciseLog.list()).find((entry) => entry.id === exercise.id),
    exercise,
  );
  step('exercise diary');

  assert.deepEqual(await other.dashboardLayout.load(), rows);
  step('dashboard layout');

  const threads = await other.chat.load();
  assert.deepEqual(
    threads[trainer.id]?.find((candidate) => candidate.id === message.id)?.text,
    message.text,
  );
  step('chat');

  // --- Undo -------------------------------------------------------------------
  await other.exerciseLog.remove(exercise.id);
  await other.coaching.save(undefined);
  await other.workoutPlan.removeWorkout(own.id);
  await other.workoutPlan.removeWorkout(fromPackage.id);
  await other.workoutPlan.savePlan(EMPTY_PLAN);
  await other.tasks.remove(task.id);
  await other.foodLog.removeEntry(food.id);
  await other.foodLog.saveMeals([...DEFAULT_MEALS]);
  await other.dashboardLayout.save(DEFAULT_DASHBOARD);
  await other.weight.setGoal(undefined);
  step('undone (the weigh-in and the chat message stay)');

  console.log('All repository checks passed.');
}

main().catch((error: unknown) => {
  console.error('FAIL:', error);
  process.exit(1);
});
