import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { StateLayer } from './state-layer';

import { Disabled, MinTouchTarget, Shape, useAppTheme, withAlpha } from '@/theme';

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: LucideIcon;
  /** Required: the button has no visible text. */
  accessibilityLabel: string;
  /** Icon color of a standard icon button; defaults to `onSurfaceVariant`. */
  color?: string;
  size?: number;
  /** `filled`: `primary` container, for an icon-only main action. */
  variant?: 'standard' | 'filled';
};

/**
 * M3 icon button: a 24dp icon in a 48×48dp touch target, with a round state
 * layer while pressed.
 */
export function IconButton({
  icon: Icon,
  color,
  size = 24,
  variant = 'standard',
  disabled,
  ...props
}: IconButtonProps) {
  const { colors } = useAppTheme();
  const filled = variant === 'filled';
  const content = disabled
    ? withAlpha(colors.onSurface, Disabled.content)
    : filled
      ? colors.onPrimary
      : (color ?? colors.onSurfaceVariant);
  const container = !filled
    ? undefined
    : disabled
      ? withAlpha(colors.onSurface, Disabled.container)
      : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={[styles.button, { backgroundColor: container }]}
      {...props}>
      {({ pressed }) => (
        <>
          <StateLayer color={content} pressed={pressed} />
          <Icon color={content} size={size} />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: MinTouchTarget,
    height: MinTouchTarget,
    borderRadius: Shape.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
