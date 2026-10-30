import type { LucideIcon } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { StateLayer } from './state-layer';

import { ThemedText } from '@/components/themed-text';
import { ComponentShape, Disabled, MinTouchTarget, Space, useAppTheme, withAlpha } from '@/theme';

/**
 * M3 button emphasis (https://m3.material.io/components/buttons):
 * - `filled`: the single main action of a screen (uses `primary`);
 * - `tonal`: important but secondary actions;
 * - `outlined`: medium emphasis, alternative actions;
 * - `text`: lowest emphasis, e.g. dialog actions.
 */
export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  /** `small` is 40dp tall (48dp touch target); `medium` is 56dp, for form submits. */
  size?: 'small' | 'medium';
  icon?: LucideIcon;
  /** Shows a spinner instead of the label and disables the button. */
  loading?: boolean;
  /** `error` colors outlined/text buttons for destructive actions such as signing out. */
  tone?: 'default' | 'error';
  /** Stretches to the full width of its parent. */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const HEIGHT = { small: 40, medium: 56 };

export function Button({
  label,
  variant = 'filled',
  size = 'small',
  icon: Icon,
  loading,
  tone = 'default',
  fullWidth,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useAppTheme();
  const inactive = disabled || loading;

  const accent = tone === 'error' ? colors.error : colors.primary;
  const palette = {
    filled: { container: colors.primary, content: colors.onPrimary },
    tonal: { container: colors.secondaryContainer, content: colors.onSecondaryContainer },
    outlined: { container: 'transparent', content: accent },
    text: { container: 'transparent', content: accent },
  }[variant];

  const container = inactive
    ? variant === 'filled' || variant === 'tonal'
      ? withAlpha(colors.onSurface, Disabled.container)
      : 'transparent'
    : palette.container;
  const content = inactive ? withAlpha(colors.onSurface, Disabled.content) : palette.content;
  const height = HEIGHT[size];
  const slop = Math.max((MinTouchTarget - height) / 2, 0);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      // Small buttons keep a 48dp touch target.
      hitSlop={{ top: slop, bottom: slop }}
      style={[
        styles.button,
        {
          height,
          backgroundColor: container,
          paddingHorizontal: variant === 'text' ? Space.md : size === 'medium' ? Space.xl : Space.lg,
        },
        variant === 'outlined' && {
          borderWidth: 1,
          borderColor: inactive ? withAlpha(colors.onSurface, Disabled.container) : colors.outlineVariant,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}>
      {({ pressed }) => (
        <>
          <StateLayer color={palette.content} pressed={pressed} />
          {loading ? (
            <ActivityIndicator color={content} />
          ) : (
            <>
              {Icon && <Icon color={content} size={size === 'medium' ? 24 : 18} aria-hidden />}
              <ThemedText
                type={size === 'medium' ? 'titleMedium' : 'labelLarge'}
                numberOfLines={1}
                style={{ color: content }}>
                {label}
              </ThemedText>
            </>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    borderRadius: ComponentShape.button,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
});
