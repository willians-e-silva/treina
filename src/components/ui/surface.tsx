import { StyleSheet } from 'react-native';

import { ThemedView, type ThemedViewProps } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

/**
 * Rounded background panel (theme `backgroundElement`) with the standard inner
 * padding. It stretches to the full width of its parent (inside a `TabScreen`,
 * the screen width minus its margins) and its height follows its content.
 *
 * Children are laid out as a column; pass `style` to change alignment or gap.
 */
export function Surface({ style, ...props }: Omit<ThemedViewProps, 'type'>) {
  return <ThemedView type="backgroundElement" style={[styles.surface, style]} {...props} />;
}

const styles = StyleSheet.create({
  surface: {
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    borderRadius: Spacing.four,
  },
});
