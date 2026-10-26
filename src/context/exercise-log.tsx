import { createContext, use, useState, type PropsWithChildren } from 'react';

import type { ExerciseEntry, NewExerciseEntry } from '@/lib/exercises';

type ExerciseLogContextValue = {
  entries: ExerciseEntry[];
  addEntry: (entry: NewExerciseEntry) => void;
  removeEntry: (id: string) => void;
};

const ExerciseLogContext = createContext<ExerciseLogContextValue | null>(null);

export function useExerciseLog() {
  const value = use(ExerciseLogContext);
  if (!value) {
    throw new Error('useExerciseLog must be wrapped in an <ExerciseLogProvider />');
  }
  return value;
}

/** Entries of one diary day plus their totals. */
export function useExerciseDay(date: string) {
  const { entries } = useExerciseLog();
  const day = entries.filter((entry) => entry.date === date);
  const cardio = day.filter((entry) => entry.category === 'cardio');
  const strength = day.filter((entry) => entry.category === 'strength');

  return {
    cardio,
    strength,
    calories: cardio.reduce((sum, entry) => sum + entry.calories, 0),
    minutes: cardio.reduce((sum, entry) => sum + entry.minutes, 0),
  };
}

let nextId = 0;
function createId() {
  nextId += 1;
  return `${Date.now()}-${nextId}`;
}

/**
 * TEMPORARY: in-memory log until there is a backend. Entries are lost when
 * the app restarts.
 */
export function ExerciseLogProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);

  function addEntry(entry: NewExerciseEntry) {
    setEntries((current) => [...current, { ...entry, id: createId() } as ExerciseEntry]);
  }

  function removeEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return (
    <ExerciseLogContext value={{ entries, addEntry, removeEntry }}>{children}</ExerciseLogContext>
  );
}
