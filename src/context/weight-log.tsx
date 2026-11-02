import { createContext, use, useState, type PropsWithChildren } from 'react';

import { useSession } from './session';

import { MOCK_DASHBOARD } from '@/lib/dashboard-data';
import { toDateKey } from '@/lib/exercises';

export type WeighIn = {
  /** `YYYY-MM-DD` (local time). */
  date: string;
  kg: number;
};

type WeightLogContextValue = {
  /** Weigh-ins, oldest first; at most one per day. */
  entries: WeighIn[];
  /** Target weight; `undefined` until the user sets one. */
  goalKg: number | undefined;
  /** Records today's weight (replacing today's earlier one) as the profile's current weight. */
  logWeight: (kg: number) => void;
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

/**
 * TEMPORARY: in-memory weigh-ins and goal until there is a backend; the
 * history starts from the mock dashboard data. Must sit inside `SessionProvider`.
 */
export function WeightLogProvider({ children }: PropsWithChildren) {
  const { setWeight } = useSession();
  const [entries, setEntries] = useState<WeighIn[]>(MOCK_DASHBOARD.weight);
  const [goalKg, setGoalKg] = useState<number | undefined>();

  function logWeight(kg: number) {
    const date = toDateKey(new Date());
    setEntries((current) =>
      [...current.filter((entry) => entry.date !== date), { date, kg }].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    );
    setWeight(kg);
  }

  return (
    <WeightLogContext value={{ entries, goalKg, logWeight, setGoal: setGoalKg }}>
      {children}
    </WeightLogContext>
  );
}
