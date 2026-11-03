import type { ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme';

/**
 * Shown instead of closing the app when a screen throws while rendering.
 * Exported as the root layout's `ErrorBoundary`, so it renders outside the
 * app's providers: it only uses React Native primitives and the theme colors.
 */
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { colors } = useAppTheme();

  useEffect(() => {
    // The splash screen would otherwise stay over this screen.
    SplashScreen.hideAsync().catch(() => {});
    // Also in `adb logcat` (tag ReactNativeJS) for release builds.
    console.error('Unhandled render error', error);
  }, [error]);

  const details = [error.name, error.message, error.stack?.split('\n').slice(0, 8).join('\n')]
    .filter(Boolean)
    .join('\n');

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.onSurface }]} accessibilityRole="header">
          Algo deu errado
        </Text>
        <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
          O app encontrou um erro e não conseguiu abrir esta tela. Tente de novo; se o erro continuar,
          envie uma captura desta tela para o suporte.
        </Text>
        <View style={[styles.details, { backgroundColor: colors.surfaceVariant }]}>
          <Text selectable style={[styles.code, { color: colors.onSurfaceVariant }]}>
            {details}
          </Text>
        </View>
        <Pressable
          onPress={retry}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.buttonLabel, { color: colors.onPrimary }]}>Tentar novamente</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  details: {
    borderRadius: 12,
    padding: 12,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
