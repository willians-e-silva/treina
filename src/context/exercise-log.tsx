import { createContext, use, type PropsWithChildren } from 'react';

import { useSession } from './session';

import { createId } from '@/data/ids';
import type { Repositories } from '@/data/types';
import { useUserStore, type StoreStatus } from '@/data/use-user-store';
import type { ExerciseEntry, NewExerciseEntry } from '@/lib/exercises';

type ExerciseLogContextValue = {
  status: StoreStatus;
  retry: () => void;
  /** A change could not be saved; `retrySave` sends it again. */
  saveFailed: boolean;
  retrySave: () => void;
  entries: ExerciseEntry[];
  addEntry: (entry: NewExerciseEntry) => void;
  removeEntry: (id: string) => void;
  /** Puts back an entry just removed ("Desfazer"), with its id. */
  restoreEntry: (entry: ExerciseEntry) => void;
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
    entries: day,
    cardio,
    strength,
    calories: cardio.reduce((sum, entry) => sum + entry.calories, 0),
    minutes: cardio.reduce((sum, entry) => sum + entry.minutes, 0),
  };
}

const EMPTY: ExerciseEntry[] = [];
const load = (repositories: Repositories) => repositories.exerciseLog.list();

/** Exercise diary of the signed-in account. Must sit inside `SessionProvider`. */
export function ExerciseLogProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const store = useUserStore(session, EMPTY, load);

  function addEntry(entry: NewExerciseEntry) {
    const created = { ...entry, id: createId() } as ExerciseEntry;
    store.update((entries) => [...entries, created]);
    store.write((repositories) => repositories.exerciseLog.add(created));
  }

  function removeEntry(id: string) {
    store.update((entries) => entries.filter((entry) => entry.id !== id));
    store.write((repositories) => repositories.exerciseLog.remove(id));
  }

  function restoreEntry(entry: ExerciseEntry) {
    store.update((entries) => [...entries, entry]);
    store.write((repositories) => repositories.exerciseLog.add(entry));
  }

  return (
    <ExerciseLogContext
      value={{
        status: store.status,
        retry: store.retry,
        saveFailed: store.saveFailed,
        retrySave: store.retrySave,
        entries: store.data,
        addEntry,
        removeEntry,
        restoreEntry,
      }}>
      {children}
    </ExerciseLogContext>
  );
}
