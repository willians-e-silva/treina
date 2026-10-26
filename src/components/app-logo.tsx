import Constants from 'expo-constants';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Brand, Spacing } from '@/constants/theme';

const APP_NAME = Constants.expoConfig?.name ?? 'treina';

type AppLogoProps = {
  size?: 'medium' | 'large';
};

/**
 * PLACEHOLDER: the project has no official logo asset yet (the images in
 * `assets/images` are the Expo template's). This renders the app name as a
 * neutral wordmark. When the real logo exists, replace the body with e.g.
 * `<Image source={require('@/assets/images/logo.png')} style={...} />` —
 * every screen that shows the logo uses this component.
 */
export function AppLogo({ size = 'medium' }: AppLogoProps) {
  const large = size === 'large';

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Logo ${APP_NAME}`}
      style={[styles.badge, large && styles.badgeLarge]}>
      <Dumbbell color={Brand.onPrimary} size={large ? 28 : 20} strokeWidth={2.5} aria-hidden />
      <ThemedText style={[styles.wordmark, large && styles.wordmarkLarge]}>{APP_NAME}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Brand.primary,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + Spacing.half,
  },
  badgeLarge: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + Spacing.half,
  },
  wordmark: {
    color: Brand.onPrimary,
    fontSize: 20,
    // Line height close to the font size so the glyphs sit centered next to
    // the icon; the badge padding makes up the difference in height.
    lineHeight: 24,
    fontWeight: 700,
    letterSpacing: 0.5,
    // Android adds extra top padding to text by default, pushing it down.
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  wordmarkLarge: {
    fontSize: 32,
    lineHeight: 36,
  },
});
