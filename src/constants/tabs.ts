// Icons are imported one per path: the package root re-exports every icon and
// Metro does not tree-shake, which adds ~2 MB to the bundle.
import type { LucideIcon } from 'lucide-react-native';
import ChartColumn from 'lucide-react-native/icons/chart-column';
import Compass from 'lucide-react-native/icons/compass';
import House from 'lucide-react-native/icons/house';
import User from 'lucide-react-native/icons/user';

export type MainTab = {
  /** Route file name inside `src/app/(tabs)/`. */
  name: 'index' | 'explore' | 'activity' | 'profile';
  /** Short label shown in the footer and used as the screen title. */
  label: string;
  /** Lucide icon (https://lucide.dev/icons) used in the footer and placeholders. */
  icon: LucideIcon;
};

/**
 * Single source of truth for the main footer tabs. Order here is the order in
 * the footer, and the first entry is the tab the app opens on.
 *
 * Labels and icons other than "Início" are temporary — rename them here once
 * the features are defined.
 */
export const MainTabs: readonly MainTab[] = [
  { name: 'index', label: 'Início', icon: House },
  { name: 'explore', label: 'Explorar', icon: Compass },
  { name: 'activity', label: 'Atividade', icon: ChartColumn },
  { name: 'profile', label: 'Perfil', icon: User },
];

export function getMainTab(name: MainTab['name']): MainTab {
  return MainTabs.find((tab) => tab.name === name)!;
}
