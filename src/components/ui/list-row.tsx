import ChevronRight from 'lucide-react-native/icons/chevron-right';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StateLayer } from './state-layer';

import { ThemedText } from '@/components/themed-text';
import { ComponentShape, MinTouchTarget, Space, useAppTheme } from '@/theme';

type ListRowProps = {
  title: string;
  /** Second line in `onSurfaceVariant`. */
  supporting?: string;
  /** Element before the text, e.g. a thumbnail. */
  leading?: ReactNode;
  /** The first and last rows round their corners so the list reads as one card. */
  first: boolean;
  last: boolean;
  onPress: () => void;
};

/**
 * M3 list item inside a grouped card (`surfaceContainer`), with dividers
 * between items and a trailing chevron: it opens a detail screen.
 */
export function ListRow({ title, supporting, leading, first, last, onPress }: ListRowProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.row,
        { backgroundColor: colors.surfaceContainer },
        first && styles.rowFirst,
        last && styles.rowLast,
      ]}>
      {({ pressed }) => (
        <>
          <StateLayer color={colors.onSurface} pressed={pressed} />
          <View
            style={[
              styles.rowInner,
              !first && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.outlineVariant,
              },
            ]}>
            {leading}
            <View style={styles.rowText}>
              <ThemedText numberOfLines={2}>{title}</ThemedText>
              {!!supporting && (
                <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" numberOfLines={1}>
                  {supporting}
                </ThemedText>
              )}
            </View>
            <ChevronRight color={colors.onSurfaceVariant} size={24} aria-hidden />
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Space.lg,
    overflow: 'hidden',
  },
  rowFirst: {
    borderTopLeftRadius: ComponentShape.card,
    borderTopRightRadius: ComponentShape.card,
    paddingTop: Space.xs,
  },
  rowLast: {
    borderBottomLeftRadius: ComponentShape.card,
    borderBottomRightRadius: ComponentShape.card,
    paddingBottom: Space.xs,
  },
  rowInner: {
    minHeight: MinTouchTarget + Space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.lg,
    paddingVertical: Space.sm,
  },
  rowText: {
    flex: 1,
  },
});
