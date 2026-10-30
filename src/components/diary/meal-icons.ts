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

import { Brand, Nutrition } from '@/constants/theme';

type MealIcon = { icon: LucideIcon; color: string };

const PRESET_ICONS: Record<string, MealIcon> = {
  breakfast: { icon: Coffee, color: Nutrition.calories },
  'morning-snack': { icon: Croissant, color: Nutrition.carbs },
  lunch: { icon: Soup, color: Nutrition.protein },
  snack: { icon: Cookie, color: Nutrition.carbs },
  'pre-workout': { icon: Zap, color: Nutrition.exercise },
  'post-workout': { icon: Dumbbell, color: Nutrition.steps },
  dinner: { icon: Moon, color: Nutrition.fat },
  supper: { icon: MoonStar, color: Nutrition.fat },
};

/** Icon of a preset meal; custom meals share a generic one. */
export function getMealIcon(mealId: string): MealIcon {
  return PRESET_ICONS[mealId] ?? { icon: Utensils, color: Brand.primary };
}
