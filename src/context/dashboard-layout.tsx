import { createContext, use, type PropsWithChildren } from 'react';

import { useSession } from './session';

import type { Repositories } from '@/data/types';
import { useUserStore, type StoreStatus } from '@/data/use-user-store';
import {
  DEFAULT_DASHBOARD,
  moveWidget as applyMove,
  type DashboardRows,
  type DashboardWidget,
  type DropTarget,
} from '@/lib/dashboard-widgets';

type DashboardLayoutContextValue = {
  status: StoreStatus;
  retry: () => void;
  /** A change could not be saved; `retrySave` sends it again. */
  saveFailed: boolean;
  retrySave: () => void;
  /** Rows of items shown on the home dashboard, top to bottom. */
  rows: DashboardRows;
  /** Items currently shown, in reading order. */
  widgets: DashboardWidget[];
  /** Adds an item on a row of its own at the end. */
  addWidget: (id: DashboardWidget) => void;
  removeWidget: (id: DashboardWidget) => void;
  moveWidget: (id: DashboardWidget, target: DropTarget) => void;
};

const DashboardLayoutContext = createContext<DashboardLayoutContextValue | null>(null);

export function useDashboardLayout() {
  const value = use(DashboardLayoutContext);
  if (!value) {
    throw new Error('useDashboardLayout must be wrapped in a <DashboardLayoutProvider />');
  }
  return value;
}

const load = (repositories: Repositories) => repositories.dashboardLayout.load();

/** Home dashboard layout of the signed-in account. Must sit inside `SessionProvider`. */
export function DashboardLayoutProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const store = useUserStore(session, DEFAULT_DASHBOARD, load);

  function change(update: (rows: DashboardRows) => DashboardRows) {
    const rows = store.update(update);
    store.write((repositories) => repositories.dashboardLayout.save(rows));
  }

  function addWidget(id: DashboardWidget) {
    change((current) => (current.flat().includes(id) ? current : [...current, [id]]));
  }

  function removeWidget(id: DashboardWidget) {
    change((current) =>
      current.map((row) => row.filter((widget) => widget !== id)).filter((row) => row.length > 0),
    );
  }

  function moveWidget(id: DashboardWidget, target: DropTarget) {
    change((current) => applyMove(current, id, target));
  }

  const rows = store.data;
  return (
    <DashboardLayoutContext
      value={{
        status: store.status,
        retry: store.retry,
        saveFailed: store.saveFailed,
        retrySave: store.retrySave,
        rows,
        widgets: rows.flat(),
        addWidget,
        removeWidget,
        moveWidget,
      }}>
      {children}
    </DashboardLayoutContext>
  );
}
