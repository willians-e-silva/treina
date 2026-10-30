import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Space } from '@/theme';

const APP_NAME = Constants.expoConfig?.name ?? 'treina';

type AppLogoProps = {
  size?: 'medium' | 'large';
};

/** App icon above the app name, for full-screen states such as loading. */
export function AppLogo({ size = 'medium' }: AppLogoProps) {
  const large = size === 'large';

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Logo ${APP_NAME}`}
      style={styles.logo}>
      <AppIcon size={large ? 96 : 64} />
      <ThemedText type={large ? 'headlineMedium' : 'titleLarge'} emphasized aria-hidden>
        {APP_NAME}
      </ThemedText>
    </View>
  );
}

/** The app icon (`assets/images/icon.png`), rounded like on the home screen. */
export function AppIcon({ size = 48 }: { size?: number }) {
  return (
    <Image
      source={require('@/assets/images/icon.png')}
      accessibilityLabel={`Logo ${APP_NAME}`}
      style={[
        styles.icon,
        // Close to the corner radius of iOS and Android launcher icons.
        { width: size, height: size, borderRadius: size * 0.225 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignItems: 'center',
    gap: Space.md,
  },
  icon: {
    alignSelf: 'center',
  },
});
