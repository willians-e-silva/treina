import { fromDateKey } from './exercises';

export type RepeatUnit = 'day' | 'week';

/** `none`: a one-off task that stays on the list until it is done. */
export type TaskRepeat = { kind: 'none' } | { kind: 'every'; interval: number; unit: RepeatUnit };

/** Step of a task. It repeats with its task, so it is done per day too. */
export type Subtask = {
  id: string;
  title: string;
  doneDates: string[];
};

export type Task = {
  id: string;
  title: string;
  repeat: TaskRepeat;
  /** First day a repeating task is due, as `YYYY-MM-DD`. */
  startDate: string;
  /**
   * Days the task was done. A one-off task is done once it has any. With
   * subtasks it is kept in sync: done exactly when all of them are.
   */
  doneDates: string[];
  subtasks: Subtask[];
};

export type NewTask = Omit<Task, 'id' | 'doneDates' | 'subtasks'> & {
  /** Titles of the subtasks. */
  subtasks: string[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(from: string, to: string) {
  // Rounded so a daylight saving change in between does not shift the count.
  return Math.round((fromDateKey(to).getTime() - fromDateKey(from).getTime()) / DAY_MS);
}

/** Whether a repeating task falls on `date`: every `interval` days or weeks since its start. */
export function isTaskDue(task: Task, date: string) {
  if (task.repeat.kind === 'none') return false;
  const days = daysBetween(task.startDate, date);
  const step = task.repeat.interval * (task.repeat.unit === 'week' ? 7 : 1);
  return days >= 0 && days % step === 0;
}

/**
 * Tasks shown on `date`: repeating tasks due that day, and one-off tasks,
 * which show every day until done and then only on the day they were done.
 */
export function getTasksForDay(tasks: Task[], date: string) {
  return {
    repeating: tasks.filter((task) => isTaskDue(task, date)),
    oneOff: tasks.filter(
      (task) =>
        task.repeat.kind === 'none' && (task.doneDates.length === 0 || task.doneDates[0] === date),
    ),
  };
}

/** Whether a task or subtask with these `doneDates` counts as done on `date`. */
export function isDoneOn(doneDates: string[], repeat: TaskRepeat, date: string) {
  return repeat.kind === 'none' ? doneDates.length > 0 : doneDates.includes(date);
}

export function isTaskDone(task: Task, date: string) {
  return isDoneOn(task.doneDates, task.repeat, date);
}

/** `doneDates` with `date` marked done or undone. A one-off item keeps a single date. */
export function markDone(doneDates: string[], repeat: TaskRepeat, date: string, done: boolean) {
  if (isDoneOn(doneDates, repeat, date) === done) return doneDates;
  if (!done) return repeat.kind === 'none' ? [] : doneDates.filter((day) => day !== date);
  return [...doneDates, date];
}

/** Marks the task done on `date` when all its subtasks are, undone otherwise. */
export function syncWithSubtasks(task: Task, date: string): Task {
  if (task.subtasks.length === 0) return task;
  const done = task.subtasks.every((subtask) => isDoneOn(subtask.doneDates, task.repeat, date));
  return { ...task, doneDates: markDone(task.doneDates, task.repeat, date, done) };
}

/** "Todo dia", "A cada 2 dias", "Toda semana", "A cada 3 semanas"… */
export function describeRepeat(repeat: TaskRepeat) {
  if (repeat.kind === 'none') return 'Não repete';
  const { interval, unit } = repeat;
  if (interval === 1) return unit === 'day' ? 'Todo dia' : 'Toda semana';
  return `A cada ${interval} ${unit === 'day' ? 'dias' : 'semanas'}`;
}
