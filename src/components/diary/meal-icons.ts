import type { LucideIcon } from 'lucide-react-native';
import Coffee from 'lucide-react-native/icons/coffee';
import Cookie from 'lucide-react-native/icons/cookie';
import Croissant from 'lucide-react-native/icons/croissant';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Moon from 'lucide-react-native/icons/moon';
import MoonStar from 'lucide-react-native/icons/moon-star';
import Soup from 'lucide-react-native/icons/soup';
import Utensils from 'lucide-react-native/icons/utensils';
import Zap from 'lucide-react-native/icons/zap';

import { useAppTheme, type CustomColorName } from '@/theme';

/** Each preset meal's icon and the theme custom color it is drawn in. */
const PRESET_ICONS: Record<string, { icon: LucideIcon; tone: CustomColorName }> = {
  breakfast: { icon: Coffee, tone: 'diet' },
  'morning-snack': { icon: Croissant, tone: 'carbs' },
  lunch: { icon: Soup, tone: 'protein' },
  snack: { icon: Cookie, tone: 'carbs' },
  'pre-workout': { icon: Zap, tone: 'exercise' },
  'post-workout': { icon: Dumbbell, tone: 'steps' },
  dinner: { icon: Moon, tone: 'fat' },
  supper: { icon: MoonStar, tone: 'fat' },
};

/**
 * Icon and color of a meal for the current light/dark mode; custom meals
 * share a generic icon in `onSurfaceVariant`.
 */
export function useMealIcon(mealId: string): { icon: LucideIcon; color: string } {
  const { colors, custom } = useAppTheme();
  const preset = PRESET_ICONS[mealId];
  return preset
    ? { icon: preset.icon, color: custom[preset.tone].color }
    : { icon: Utensils, color: colors.onSurfaceVariant };
}
