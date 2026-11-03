import { createContext, use, type PropsWithChildren } from 'react';

import { useSession } from './session';

import type { Repositories, WeightLogData } from '@/data/types';
import { useUserStore, type StoreStatus } from '@/data/use-user-store';
import { upsertWeighIn, type WeighIn } from '@/lib/weight';

export type { WeighIn } from '@/lib/weight';

type WeightLogContextValue = {
  status: StoreStatus;
  retry: () => void;
  /** A change could not be saved; `retrySave` sends it again. */
  saveFailed: boolean;
  retrySave: () => void;
  /** Weigh-ins, oldest first; at most one per day. */
  entries: WeighIn[];
  /** Target weight; `undefined` until the user sets one. */
  goalKg: number | undefined;
  /**
   * Records the weight measured on `date` (`YYYY-MM-DD`), replacing that day's
   * earlier one. The latest weigh-in is the profile's current weight.
   */
  logWeight: (kg: number, date: string) => void;
  /** `undefined` removes the goal. */
  setGoal: (kg: number | undefined) => void;
};

const WeightLogContext = createContext<WeightLogContextValue | null>(null);

export function useWeightLog() {
  const value = use(WeightLogContext);
  if (!value) {
    throw new Error('useWeightLog must be wrapped in a <WeightLogProvider />');
  }
  return value;
}

const EMPTY: WeightLogData = { entries: [], goalKg: undefined };
const load = (repositories: Repositories) => repositories.weight.load();

/** Weigh-ins and goal of the signed-in account. Must sit inside `SessionProvider`. */
export function WeightLogProvider({ children }: PropsWithChildren) {
  const { session, setWeight } = useSession();
  const store = useUserStore(session, EMPTY, load);

  function logWeight(kg: number, date: string) {
    const weighIn = { date, kg };
    const entries = upsertWeighIn(store.data.entries, weighIn);
    store.update((data) => ({ ...data, entries: upsertWeighIn(data.entries, weighIn) }));
    store.write((repositories) => repositories.weight.saveWeighIn(weighIn));
    // An older measurement goes into the history without changing the current weight.
    setWeight(entries[entries.length - 1].kg);
  }

  function setGoal(kg: number | undefined) {
    store.update((data) => ({ ...data, goalKg: kg }));
    store.write((repositories) => repositories.weight.setGoal(kg));
  }

  return (
    <WeightLogContext
      value={{
        status: store.status,
        retry: store.retry,
        saveFailed: store.saveFailed,
        retrySave: store.retrySave,
        entries: store.data.entries,
        goalKg: store.data.goalKg,
        logWeight,
        setGoal,
      }}>
      {children}
    </WeightLogContext>
  );
}
