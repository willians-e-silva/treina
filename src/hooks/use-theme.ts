/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  // `null` until the scheme is known.
  const theme = scheme === 'dark' ? 'dark' : 'light';

  return Colors[theme];
}
