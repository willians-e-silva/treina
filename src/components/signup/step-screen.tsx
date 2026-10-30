import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StepScreenProps = PropsWithChildren<{
  step: number;
  steps: number;
  title: string;
  description: string;
  error?: string | null;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: () => void;
}>;

/** Shared layout of the sign-up steps: progress, title, fields and the main button. */
export function StepScreen({
  step,
  steps,
  title,
  description,
  error,
  submitLabel,
  submitting,
  onSubmit,
  children,
}: StepScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.progress} accessibilityLabel={`Etapa ${step} de ${steps}`}>
            {Array.from({ length: steps }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.progressStep,
                  { backgroundColor: index < step ? Brand.primary : theme.backgroundSelected },
                ]}
              />
            ))}
          </View>
          <ThemedText type="subtitle" accessibilityRole="header">
            {title}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{description}</ThemedText>
        </View>

        <View style={styles.form}>
          {children}

          {error && (
            <ThemedText type="small" style={styles.error} accessibilityRole="alert">
              {error}
            </ThemedText>
          )}

          <Pressable
            onPress={onSubmit}
            disabled={submitting}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, (pressed || submitting) && styles.pressed]}>
            {submitting ? (
              <ActivityIndicator color={Brand.onPrimary} />
            ) : (
              <ThemedText style={styles.buttonText}>{submitLabel}</ThemedText>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.five,
  },
  header: {
    gap: Spacing.two,
  },
  progress: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  form: {
    gap: Spacing.three,
  },
  error: {
    color: Brand.danger,
  },
  button: {
    height: 52,
    borderRadius: Spacing.three,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: Brand.onPrimary,
    fontWeight: 600,
  },
});
