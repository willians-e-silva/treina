import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { Shape, useAppTheme } from '@/theme';

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
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.surface }]}
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
                  {
                    // `secondary`: primary is kept for the screen's main button.
                    backgroundColor:
                      index < step ? colors.secondary : colors.surfaceContainerHighest,
                  },
                ]}
              />
            ))}
          </View>
          <ThemedText type="headlineMedium" accessibilityRole="header">
            {title}
          </ThemedText>
          <ThemedText themeColor="onSurfaceVariant">{description}</ThemedText>
        </View>

        <View style={styles.form}>
          {children}

          {error && (
            <ThemedText type="bodyMedium" themeColor="error" accessibilityRole="alert">
              {error}
            </ThemedText>
          )}

          <Button
            label={submitLabel}
            size="medium"
            fullWidth
            loading={submitting}
            onPress={onSubmit}
            style={styles.submit}
          />
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
    borderRadius: Shape.full,
  },
  form: {
    gap: Spacing.three,
  },
  submit: {
    marginTop: Spacing.two,
  },
});
