import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from './app-logo';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Button } from './ui/button';

import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/theme';

type MainFlowLoadingProps =
  | { status: 'loading' }
  | { status: 'error'; message: string; onRetry: () => void; onSignOut: () => void };

/** Full-screen state shown between a successful login and the main tabs. */
export function MainFlowLoading(props: MainFlowLoadingProps) {
  const { colors } = useAppTheme();

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
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
              Preparando tudo para você…
            </ThemedText>
          </View>
        ) : (
          <View style={styles.status}>
            <ThemedText style={styles.errorText} accessibilityRole="alert">
              {props.message}
            </ThemedText>

            <Button
              label="Tentar novamente"
              size="medium"
              fullWidth
              onPress={props.onRetry}
            />
            <Button label="Sair" variant="outlined" fullWidth onPress={props.onSignOut} />
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
});
