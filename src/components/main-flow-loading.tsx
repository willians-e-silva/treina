import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from './app-logo';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type MainFlowLoadingProps =
  | { status: 'loading' }
  | { status: 'error'; message: string; onRetry: () => void; onSignOut: () => void };

/** Full-screen state shown between a successful login and the main tabs. */
export function MainFlowLoading(props: MainFlowLoadingProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <AppLogo size="large" />

        {props.status === 'loading' ? (
          <View
            style={styles.status}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Carregando"
            accessibilityState={{ busy: true }}>
            <ActivityIndicator size="large" color={Brand.primary} />
            <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
              Preparando tudo para você…
            </ThemedText>
          </View>
        ) : (
          <View style={styles.status}>
            <ThemedText style={styles.errorText} accessibilityRole="alert">
              {props.message}
            </ThemedText>

            <Pressable
              onPress={props.onRetry}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <ThemedText style={styles.buttonText}>Tentar novamente</ThemedText>
            </Pressable>

            <Pressable
              onPress={props.onSignOut}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
              <ThemedText type="bodyMedium" style={{ color: theme.textSecondary }}>
                Sair
              </ThemedText>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  status: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    gap: Spacing.three,
  },
  errorText: {
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    height: 52,
    borderRadius: Spacing.three,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Brand.onPrimary,
    fontWeight: 600,
  },
  secondaryButton: {
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
