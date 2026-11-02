import type { LucideIcon } from 'lucide-react-native';
import ChartPie from 'lucide-react-native/icons/chart-pie';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Flame from 'lucide-react-native/icons/flame';
import Footprints from 'lucide-react-native/icons/footprints';
import ListChecks from 'lucide-react-native/icons/list-checks';
import Scale from 'lucide-react-native/icons/scale';

export type DashboardWidget = 'calories' | 'macros' | 'steps' | 'exercise' | 'tasks' | 'weight';

/** Every item the home dashboard can show. */
export const DASHBOARD_WIDGETS: readonly { id: DashboardWidget; label: string; icon: LucideIcon }[] = [
  { id: 'calories', label: 'Meta diária', icon: Flame },
  { id: 'macros', label: 'Macronutrientes', icon: ChartPie },
  { id: 'steps', label: 'Passos', icon: Footprints },
  { id: 'exercise', label: 'Exercício', icon: Dumbbell },
  { id: 'tasks', label: 'Tarefas', icon: ListChecks },
  { id: 'weight', label: 'Peso', icon: Scale },
];

export function getWidgetInfo(id: DashboardWidget) {
  return DASHBOARD_WIDGETS.find((widget) => widget.id === id)!;
}

/**
 * The dashboard as rows, top to bottom. A row holds one item at full width,
 * two side by side in their compact version, or three or more in a carousel
 * at full size.
 */
export type DashboardRows = DashboardWidget[][];

/** Layout the dashboard starts with. */
export const DEFAULT_DASHBOARD: DashboardRows = [
  ['calories'],
  ['macros'],
  ['steps', 'exercise'],
  ['tasks'],
  ['weight'],
];

/** Items a row shows side by side; more than this turns the row into a carousel. */
export const MAX_SIDE_BY_SIDE = 2;

/**
 * Where a dragged item lands:
 * - `insert`: on a row of its own, before row `index` (`rows.length` = at the end);
 * - `join`: into row `index`, at `position` among its items.
 */
export type DropTarget =
  | { kind: 'insert'; index: number }
  | { kind: 'join'; index: number; position: number };

/** `rows` with `id` moved to `target`. Rows left empty are dropped. */
export function moveWidget(rows: DashboardRows, id: DashboardWidget, target: DropTarget) {
  // Mark the item's old spot instead of removing it first, so `target.index`
  // still refers to the rows as they were when the drop was computed.
  const marked = rows.map((row) => row.map((widget) => (widget === id ? null : widget)));

  if (target.kind === 'insert') {
    marked.splice(target.index, 0, [id]);
  } else {
    const row = marked[target.index];
    if (!row || rows[target.index].includes(id)) return rows;
    row.splice(Math.min(target.position, row.length), 0, id);
  }

  return marked
    .map((row) => row.filter((widget): widget is DashboardWidget => widget !== null))
    .filter((row) => row.length > 0);
}
