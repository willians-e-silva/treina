import { StyleSheet, View } from 'react-native';

import { ThemedTextInput, type ThemedTextInputProps } from './text-input';

import { ThemedText } from '@/components/themed-text';
import { Space } from '@/theme';

type FormFieldProps = Omit<ThemedTextInputProps, 'size'> & {
  label: string;
  /** Shown inside the input on the right, e.g. `"kg"`. */
  unit?: string;
};

/** M3 filled text field with its label above. */
export function FormField({ label, unit, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <ThemedText type="labelLarge" themeColor="onSurfaceVariant">
        {label}
      </ThemedText>
      <View>
        <ThemedTextInput
          accessibilityLabel={label}
          style={[!!unit && styles.inputWithUnit, style]}
          {...props}
        />
        {unit && (
          <View style={styles.unit} pointerEvents="none">
            <ThemedText type="bodyLarge" themeColor="onSurfaceVariant">
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
    gap: Space.sm,
  },
  inputWithUnit: {
    paddingRight: Space.huge,
  },
  unit: {
    position: 'absolute',
    right: Space.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
