import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { StateLayer } from './state-layer';

import { ThemedText } from '@/components/themed-text';
import { ComponentElevation, ComponentShape, shadowFor, Space, useAppTheme } from '@/theme';

type FabProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: LucideIcon;
  /** Extended FAB label; the icon-only FAB needs `accessibilityLabel`. */
  label?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * M3 floating action button (extended when it has a label): the main action
 * of a screen, in `primaryContainer` with a level 3 shadow.
 */
export function Fab({ icon: Icon, label, style, ...props }: FabProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.fab,
        label ? styles.extended : styles.square,
        {
          backgroundColor: colors.primaryContainer,
          boxShadow: shadowFor(ComponentElevation.fab, colors),
        },
        style,
      ]}
      {...props}>
      {({ pressed }) => (
        <>
          <StateLayer color={colors.onPrimaryContainer} pressed={pressed} />
          <Icon color={colors.onPrimaryContainer} size={24} aria-hidden={!!label} />
          {label && (
            <ThemedText type="labelLarge" style={{ color: colors.onPrimaryContainer }}>
              {label}
            </ThemedText>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    height: 56,
    borderRadius: ComponentShape.fab,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.md,
  },
  square: {
    width: 56,
  },
  extended: {
    paddingHorizontal: Space.lg,
  },
});
