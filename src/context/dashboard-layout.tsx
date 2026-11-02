import { createContext, use, useState, type PropsWithChildren } from 'react';

import {
  DEFAULT_DASHBOARD,
  moveWidget as applyMove,
  type DashboardRows,
  type DashboardWidget,
  type DropTarget,
} from '@/lib/dashboard-widgets';

type DashboardLayoutContextValue = {
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

/**
 * TEMPORARY: in-memory layout until there is a backend. The dashboard goes
 * back to the default layout when the app restarts.
 */
export function DashboardLayoutProvider({ children }: PropsWithChildren) {
  const [rows, setRows] = useState<DashboardRows>(DEFAULT_DASHBOARD);

  function addWidget(id: DashboardWidget) {
    setRows((current) => (current.flat().includes(id) ? current : [...current, [id]]));
  }

  function removeWidget(id: DashboardWidget) {
    setRows((current) =>
      current.map((row) => row.filter((widget) => widget !== id)).filter((row) => row.length > 0),
    );
  }

  function moveWidget(id: DashboardWidget, target: DropTarget) {
    setRows((current) => applyMove(current, id, target));
  }

  return (
    <DashboardLayoutContext
      value={{ rows, widgets: rows.flat(), addWidget, removeWidget, moveWidget }}>
      {children}
    </DashboardLayoutContext>
  );
}
