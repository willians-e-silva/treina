import { describe, expect, it } from '@jest/globals';

import {
  describeRepeat,
  getTasksForDay,
  isDoneOn,
  markDone,
  syncWithSubtasks,
  type Task,
} from '../tasks';

const daily = { kind: 'every', interval: 1, unit: 'day' } as const;
const once = { kind: 'none' } as const;

function task(overrides: Partial<Task>): Task {
  return {
    id: 't',
    title: 'Beber água',
    repeat: daily,
    startDate: '2026-11-01',
    doneDates: [],
    subtasks: [],
    ...overrides,
  };
}

describe('markDone', () => {
  it('keeps one date for a one-off task', () => {
    expect(markDone([], once, '2026-11-10', true)).toEqual(['2026-11-10']);
    expect(markDone(['2026-11-10'], once, '2026-11-11', false)).toEqual([]);
  });

  it('marks each day of a repeating task on its own', () => {
    const dates = markDone(['2026-11-09'], daily, '2026-11-10', true);
    expect(dates).toEqual(['2026-11-09', '2026-11-10']);
    expect(markDone(dates, daily, '2026-11-09', false)).toEqual(['2026-11-10']);
  });

  it('returns the same array when nothing changes', () => {
    const dates = ['2026-11-10'];
    expect(markDone(dates, daily, '2026-11-10', true)).toBe(dates);
  });
});

describe('isDoneOn', () => {
  it('counts a one-off task as done on any later day', () => {
    expect(isDoneOn(['2026-11-10'], once, '2026-11-12')).toBe(true);
    expect(isDoneOn(['2026-11-10'], daily, '2026-11-12')).toBe(false);
  });
});

describe('getTasksForDay', () => {
  it('keeps an undone one-off task on every day, and a done one only on its day', () => {
    const open = task({ id: 'a', repeat: once });
    const done = task({ id: 'b', repeat: once, doneDates: ['2026-11-10'] });
    expect(getTasksForDay([open, done], '2026-11-10').oneOff).toEqual([open, done]);
    expect(getTasksForDay([open, done], '2026-11-11').oneOff).toEqual([open]);
  });

  it('shows a repeating task from its start date', () => {
    const repeating = task({ startDate: '2026-11-10' });
    expect(getTasksForDay([repeating], '2026-11-09').repeating).toEqual([]);
    expect(getTasksForDay([repeating], '2026-11-10').repeating).toEqual([repeating]);
  });
});

describe('syncWithSubtasks', () => {
  it('marks the task done only when every subtask is', () => {
    const date = '2026-11-10';
    const partial = task({
      subtasks: [
        { id: 's1', title: 'Manhã', doneDates: [date] },
        { id: 's2', title: 'Tarde', doneDates: [] },
      ],
    });
    expect(syncWithSubtasks(partial, date).doneDates).toEqual([]);

    const all = {
      ...partial,
      subtasks: partial.subtasks.map((subtask) => ({ ...subtask, doneDates: [date] })),
    };
    expect(syncWithSubtasks(all, date).doneDates).toEqual([date]);
  });
});

describe('describeRepeat', () => {
  it('describes the interval in Portuguese', () => {
    expect(describeRepeat(once)).toBe('Não repete');
    expect(describeRepeat(daily)).toBe('Todo dia');
    expect(describeRepeat({ kind: 'every', interval: 1, unit: 'week' })).toBe('Toda semana');
  });
});
