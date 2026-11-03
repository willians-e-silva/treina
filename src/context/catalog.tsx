import { createContext, use, type PropsWithChildren } from 'react';

import { useSession } from './session';

import type { Repositories } from '@/data/types';
import { useUserStore, type StoreStatus } from '@/data/use-user-store';
import { findPackage, findTrainer, searchTrainers, type Trainer } from '@/lib/trainers';

type CatalogContextValue = {
  status: StoreStatus;
  retry: () => void;
  /** A change could not be saved; `retrySave` sends it again. */
  saveFailed: boolean;
  retrySave: () => void;
  trainers: Trainer[];
  getTrainer: (id: string) => Trainer | undefined;
  /** The package with `id` and the trainer who published it. */
  getPackage: (id: string) => ReturnType<typeof findPackage>;
  /** Trainers whose name contains every word of `query`, ignoring accents. */
  searchTrainers: (query: string) => readonly Trainer[];
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function useCatalog() {
  const value = use(CatalogContext);
  if (!value) {
    throw new Error('useCatalog must be wrapped in a <CatalogProvider />');
  }
  return value;
}

const EMPTY: Trainer[] = [];
const load = (repositories: Repositories) => repositories.catalog.load();

/**
 * The trainers and their packages, loaded with the account's data when the
 * main flow starts. Must sit inside `SessionProvider`.
 */
export function CatalogProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const store = useUserStore(session, EMPTY, load);
  const trainers = store.data;

  return (
    <CatalogContext
      value={{
        status: store.status,
        retry: store.retry,
        saveFailed: store.saveFailed,
        retrySave: store.retrySave,
        trainers,
        getTrainer: (id) => findTrainer(trainers, id),
        getPackage: (id) => findPackage(trainers, id),
        searchTrainers: (query) => searchTrainers(trainers, query),
      }}>
      {children}
    </CatalogContext>
  );
}
