// Icons are imported one per path: the package root re-exports every icon and
// Metro does not tree-shake, which adds ~2 MB to the bundle.
import type { LucideIcon } from 'lucide-react-native';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import House from 'lucide-react-native/icons/house';
import ListChecks from 'lucide-react-native/icons/list-checks';
import NotebookPen from 'lucide-react-native/icons/notebook-pen';
import User from 'lucide-react-native/icons/user';

export type MainTab = {
  /** Route file name inside `src/app/(tabs)/`. */
  name: 'index' | 'diary' | 'exercise' | 'tasks' | 'profile';
  /** Short label shown in the footer and used as the screen title. */
  label: string;
  /** Lucide icon (https://lucide.dev/icons) used in the footer and placeholders. */
  icon: LucideIcon;
};

/**
 * Single source of truth for the main footer tabs. Order here is the order in
 * the footer, and the first entry is the tab the app opens on.
 */
export const MainTabs: readonly MainTab[] = [
  { name: 'index', label: 'Início', icon: House },
  { name: 'diary', label: 'Diário', icon: NotebookPen },
  { name: 'exercise', label: 'Exercícios', icon: Dumbbell },
  { name: 'tasks', label: 'Tarefas', icon: ListChecks },
  { name: 'profile', label: 'Perfil', icon: User },
];

export function getMainTab(name: MainTab['name']): MainTab {
  return MainTabs.find((tab) => tab.name === name)!;
}
