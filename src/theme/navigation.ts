/**
 * Expo Router integration of the design system: the navigation theme (screen
 * backgrounds, native headers) and the M3 top app bar options for stacks.
 */
import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';

import { useAppTheme } from './index';

/** Navigation theme built from the M3 color roles of the current mode. */
export function useNavigationTheme(): Theme {
  const { dark, colors } = useAppTheme();
  const base = dark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      primary: colors.primary,
      background: colors.surface,
      card: colors.surface,
      text: colors.onSurface,
      border: colors.outlineVariant,
      notification: colors.error,
    },
  };
}

/**
 * M3 small top app bar for stack headers: `surface` container, `titleLarge`
 * title in `onSurface`, no divider.
 */
export function useTopAppBarOptions() {
  const { colors, typography } = useAppTheme();
  const { fontSize, fontWeight } = typography.titleLarge;
  return {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.onSurface,
    headerTitleStyle: { fontSize, fontWeight, color: colors.onSurface },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    // Opaque: since SDK 58 the header is transparent on iOS 26+ and the
    // screens would scroll under it.
    headerTransparent: false,
    contentStyle: { backgroundColor: colors.surface },
  } as const;
}
