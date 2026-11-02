import { createContext, use, type PropsWithChildren } from 'react';

import { useSession } from './session';

import { createId } from '@/data/ids';
import type { Repositories } from '@/data/types';
import { useUserStore, type StoreStatus } from '@/data/use-user-store';
import {
  isDoneOn,
  isTaskDone,
  markDone,
  syncWithSubtasks,
  type NewTask,
  type Task,
} from '@/lib/tasks';

type TasksContextValue = {
  status: StoreStatus;
  retry: () => void;
  tasks: Task[];
  addTask: (task: NewTask) => void;
  removeTask: (id: string) => void;
  /** Marks the task, and all its subtasks, done on `date`, or undone if it already was. */
  toggleTask: (id: string, date: string) => void;
  /** `date` is the day on screen, where the task's done state is updated. */
  addSubtask: (taskId: string, title: string, date: string) => void;
  removeSubtask: (taskId: string, subtaskId: string, date: string) => void;
  /** Marks the subtask done on `date`, or undone; the task follows its subtasks. */
  toggleSubtask: (taskId: string, subtaskId: string, date: string) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

export function useTasks() {
  const value = use(TasksContext);
  if (!value) {
    throw new Error('useTasks must be wrapped in a <TasksProvider />');
  }
  return value;
}

const EMPTY: Task[] = [];
const load = (repositories: Repositories) => repositories.tasks.list();

/** Tasks of the signed-in account. Must sit inside `SessionProvider`. */
export function TasksProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const store = useUserStore(session, EMPTY, load);

  function updateTask(id: string, change: (task: Task) => Task) {
    const tasks = store.update((current) =>
      current.map((task) => (task.id === id ? change(task) : task)),
    );
    const updated = tasks.find((task) => task.id === id);
    if (updated) store.write((repositories) => repositories.tasks.update(updated));
  }

  function addTask({ subtasks, ...task }: NewTask) {
    const created: Task = {
      ...task,
      id: createId(),
      doneDates: [],
      subtasks: subtasks.map((title) => ({ id: createId(), title, doneDates: [] })),
    };
    store.update((current) => [...current, created]);
    store.write((repositories) => repositories.tasks.add(created));
  }

  function removeTask(id: string) {
    store.update((current) => current.filter((task) => task.id !== id));
    store.write((repositories) => repositories.tasks.remove(id));
  }

  function toggleTask(id: string, date: string) {
    updateTask(id, (task) => {
      const done = !isTaskDone(task, date);
      return {
        ...task,
        doneDates: markDone(task.doneDates, task.repeat, date, done),
        subtasks: task.subtasks.map((subtask) => ({
          ...subtask,
          doneDates: markDone(subtask.doneDates, task.repeat, date, done),
        })),
      };
    });
  }

  function addSubtask(taskId: string, title: string, date: string) {
    updateTask(taskId, (task) =>
      syncWithSubtasks(
        { ...task, subtasks: [...task.subtasks, { id: createId(), title, doneDates: [] }] },
        date,
      ),
    );
  }

  function removeSubtask(taskId: string, subtaskId: string, date: string) {
    updateTask(taskId, (task) =>
      syncWithSubtasks(
        { ...task, subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId) },
        date,
      ),
    );
  }

  function toggleSubtask(taskId: string, subtaskId: string, date: string) {
    updateTask(taskId, (task) => {
      const subtasks = task.subtasks.map((subtask) => {
        if (subtask.id !== subtaskId) return subtask;
        const done = !isDoneOn(subtask.doneDates, task.repeat, date);
        return { ...subtask, doneDates: markDone(subtask.doneDates, task.repeat, date, done) };
      });
      return syncWithSubtasks({ ...task, subtasks }, date);
    });
  }

  return (
    <TasksContext
      value={{
        status: store.status,
        retry: store.retry,
        tasks: store.data,
        addTask,
        removeTask,
        toggleTask,
        addSubtask,
        removeSubtask,
        toggleSubtask,
      }}>
      {children}
    </TasksContext>
  );
}
