import type { Json } from '../database.types';
import type { DashboardLayoutRepository } from '../types';
import { done, maybe, supabase } from './client';

import {
  DASHBOARD_WIDGETS,
  DEFAULT_DASHBOARD,
  type DashboardRows,
  type DashboardWidget,
} from '@/lib/dashboard-widgets';

const KNOWN = new Set<string>(DASHBOARD_WIDGETS.map((widget) => widget.id));

/** Saved rows, keeping only widgets this version of the app knows. */
function toRows(json: Json): DashboardRows {
  if (!Array.isArray(json)) return DEFAULT_DASHBOARD;
  return json
    .map((row) =>
      Array.isArray(row)
        ? row.filter((id): id is DashboardWidget => typeof id === 'string' && KNOWN.has(id))
        : [],
    )
    .filter((row) => row.length > 0);
}

/** `dashboard_layouts`; an account without a row has the default layout. */
export function dashboardLayoutRepository(userId: string): DashboardLayoutRepository {
  return {
    async load() {
      const row = maybe(
        await supabase.from('dashboard_layouts').select('rows').eq('user_id', userId).maybeSingle(),
      );
      return row ? toRows(row.rows) : DEFAULT_DASHBOARD;
    },

    async save(rows) {
      done(await supabase.from('dashboard_layouts').upsert({ user_id: userId, rows }));
    },
  };
}
