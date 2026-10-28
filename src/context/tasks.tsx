import { createContext, use, useState, type PropsWithChildren } from 'react';

import {
  isDoneOn,
  isTaskDone,
  markDone,
  syncWithSubtasks,
  type NewTask,
  type Task,
} from '@/lib/tasks';

type TasksContextValue = {
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

let nextId = 0;
function createId() {
  nextId += 1;
  return `${Date.now()}-${nextId}`;
}

/**
 * TEMPORARY: in-memory list until there is a backend. Tasks are lost when the
 * app restarts.
 */
export function TasksProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);

  function updateTask(id: string, update: (task: Task) => Task) {
    setTasks((current) => current.map((task) => (task.id === id ? update(task) : task)));
  }

  function addTask({ subtasks, ...task }: NewTask) {
    const created: Task = {
      ...task,
      id: createId(),
      doneDates: [],
      subtasks: subtasks.map((title) => ({ id: createId(), title, doneDates: [] })),
    };
    setTasks((current) => [...current, created]);
  }

  function removeTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
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
        tasks,
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
