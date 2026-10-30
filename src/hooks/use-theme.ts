import { useAppTheme } from '@/theme';

/**
 * TEMPORARY: old color names mapped onto the M3 roles while the screens move
 * to `useAppTheme()`. Removed once nothing uses it.
 */
export function useTheme() {
  const { colors } = useAppTheme();
  return {
    text: colors.onSurface,
    background: colors.surface,
    backgroundElement: colors.surfaceContainer,
    backgroundSelected: colors.surfaceContainerHighest,
    textSecondary: colors.onSurfaceVariant,
  };
}
