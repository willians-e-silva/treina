import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedTextInput, type ThemedTextInputProps } from './text-input';

import { ThemedText } from '@/components/themed-text';
import { Space } from '@/theme';

export type FormFieldProps = Omit<ThemedTextInputProps, 'size'> & {
  label: string;
  /** Shown inside the input on the right, e.g. `"kg"`. */
  unit?: string;
  /** Shown inside the input on the right, e.g. an icon button. */
  trailing?: ReactNode;
};

/** M3 filled text field with its label above. */
export function FormField({ label, unit, trailing, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <ThemedText type="labelLarge" themeColor="onSurfaceVariant">
        {label}
      </ThemedText>
      <View>
        <ThemedTextInput
          accessibilityLabel={label}
          style={[(!!unit || !!trailing) && styles.inputWithUnit, style]}
          {...props}
        />
        {unit && (
          <View style={styles.unit} pointerEvents="none">
            <ThemedText type="bodyLarge" themeColor="onSurfaceVariant">
              {unit}
            </ThemedText>
          </View>
        )}
        {trailing && <View style={styles.trailing}>{trailing}</View>}
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
  trailing: {
    position: 'absolute',
    right: Space.xs,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
