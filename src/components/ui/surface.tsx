import { StyleSheet } from 'react-native';

import { ThemedView, type ThemedViewProps } from '@/components/themed-view';
import { ComponentShape, Space } from '@/theme';

/**
 * M3 filled card: a rounded panel in `surfaceContainer` with the standard
 * inner padding. It stretches to the full width of its parent (inside a
 * `TabScreen`, the screen width minus its margins) and its height follows its
 * content.
 *
 * Children are laid out as a column; pass `style` to change alignment or gap.
 */
export function Surface({ style, ...props }: Omit<ThemedViewProps, 'type'>) {
  return <ThemedView type="surfaceContainer" style={[styles.surface, style]} {...props} />;
}

const styles = StyleSheet.create({
  surface: {
    alignSelf: 'stretch',
    paddingHorizontal: Space.lg,
    paddingVertical: Space.xl,
    borderRadius: ComponentShape.card,
  },
});
