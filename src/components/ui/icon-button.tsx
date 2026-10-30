import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { StateLayer } from './state-layer';

import { Disabled, MinTouchTarget, Shape, useAppTheme, withAlpha } from '@/theme';

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: LucideIcon;
  /** Required: the button has no visible text. */
  accessibilityLabel: string;
  /** Icon color; defaults to `onSurfaceVariant` (M3 standard icon button). */
  color?: string;
  size?: number;
};

/**
 * M3 standard icon button: a 24dp icon in a 48×48dp touch target, with a
 * round state layer while pressed.
 */
export function IconButton({ icon: Icon, color, size = 24, disabled, ...props }: IconButtonProps) {
  const { colors } = useAppTheme();
  const content = disabled
    ? withAlpha(colors.onSurface, Disabled.content)
    : (color ?? colors.onSurfaceVariant);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={styles.button}
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
