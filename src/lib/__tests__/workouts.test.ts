import { describe, expect, it } from '@jest/globals';

import { estimateCalories } from '../exercises';
import { EMPTY_PLAN, formatDuration, getWorkoutForDate, type Workout } from '../workouts';

const a: Workout = { id: 'a', name: 'Treino A', exercises: [] };
const b: Workout = { id: 'b', name: 'Treino B', exercises: [] };
// 2026-11-09 is a Monday (weekday 1).
const monday = '2026-11-09';

describe('getWorkoutForDate', () => {
  it('uses the weekday in weekly mode', () => {
    const plan = { ...EMPTY_PLAN, weekly: { 1: 'a' } };
    expect(getWorkoutForDate(plan, [a, b], [], monday, monday)).toEqual({
      workout: a,
      done: false,
    });
    expect(getWorkoutForDate(plan, [a, b], [], '2026-11-10', monday)).toBeUndefined();
  });

  it('shows the workout done that day first', () => {
    const plan = { ...EMPTY_PLAN, weekly: { 1: 'a' } };
    const completions = [{ date: monday, workoutId: 'b' }];
    expect(getWorkoutForDate(plan, [a, b], completions, monday, monday)).toEqual({
      workout: b,
      done: true,
    });
  });

  it('follows the queue only from today on, wrapping at the end', () => {
    const plan = { ...EMPTY_PLAN, mode: 'queue' as const, queue: ['a', 'b'], queueIndex: 3 };
    expect(getWorkoutForDate(plan, [a, b], [], monday, monday)?.workout).toBe(b);
    expect(getWorkoutForDate(plan, [a, b], [], '2026-11-08', monday)).toBeUndefined();
  });
});

describe('formatDuration', () => {
  it('formats minutes and hours', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3725)).toBe('1:02:05');
  });
});

describe('estimateCalories', () => {
  it('uses MET × 3.5 × kg / 200 per minute', () => {
    expect(estimateCalories(8, 70, 30)).toBe(294);
  });
});
