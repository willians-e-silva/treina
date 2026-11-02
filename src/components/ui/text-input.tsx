import { useState, type Ref } from 'react';
import { StyleSheet, TextInput, type TextInputInstance, type TextInputProps } from 'react-native';

import { ComponentShape, Disabled, Space, useAppTheme } from '@/theme';

export type ThemedTextInputProps = TextInputProps & {
  ref?: Ref<TextInputInstance>;
  /**
   * `field`: M3 filled text field (`surfaceContainerHighest`, 56dp).
   * `compact`: same look at 48dp, for short values inside cards.
   */
  size?: 'field' | 'compact';
};

/**
 * Text input with the M3 filled text field look: tinted container, rounded
 * corners matching the icon's soft shapes, and a 2dp `primary` outline while
 * focused (the focus indicator). Text uses `bodyLarge`.
 */
export function ThemedTextInput({
  size = 'field',
  style,
  onFocus,
  onBlur,
  editable = true,
  ...props
}: ThemedTextInputProps) {
  const { colors, typography } = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={colors.onSurfaceVariant}
      selectionColor={colors.primary}
      cursorColor={colors.primary}
      editable={editable}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={[
        styles.input,
        typography.bodyLarge,
        {
          height: size === 'field' ? 56 : 48,
          color: colors.onSurface,
          backgroundColor: colors.surfaceContainerHighest,
          borderColor: focused ? colors.primary : 'transparent',
          opacity: editable ? 1 : Disabled.content,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: ComponentShape.textField,
    borderWidth: 2,
    paddingHorizontal: Space.lg - 2,
  },
});
