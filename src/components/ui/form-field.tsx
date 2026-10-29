import type { Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormFieldProps = TextInputProps & {
  label: string;
  /** Shown inside the input on the right, e.g. `"kg"`. */
  unit?: string;
  ref?: Ref<TextInput>;
};

/** Labeled text input with the login screen's look. */
export function FormField({ label, unit, style, ref, ...props }: FormFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View>
        <TextInput
          ref={ref}
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel={label}
          style={[
            styles.input,
            { backgroundColor: theme.backgroundElement, color: theme.text },
            !!unit && styles.inputWithUnit,
            style,
          ]}
          {...props}
        />
        {unit && (
          <View style={styles.unit} pointerEvents="none">
            <ThemedText type="small" themeColor="textSecondary">
              {unit}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  input: {
    height: 52,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  inputWithUnit: {
    paddingRight: 56,
  },
  unit: {
    position: 'absolute',
    right: Spacing.three,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
