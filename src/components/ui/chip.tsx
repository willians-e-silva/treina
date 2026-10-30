import type { LucideIcon } from 'lucide-react-native';
import Check from 'lucide-react-native/icons/check';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { StateLayer } from './state-layer';

import { ThemedText } from '@/components/themed-text';
import { ComponentShape, MinTouchTarget, Space, useAppTheme } from '@/theme';

const HEIGHT = 32;
/** Extends the 32dp chip to a 48dp touch target. */
const SLOP = (MinTouchTarget - HEIGHT) / 2;

type ChipProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /**
   * Filter chip when set: selected chips are filled with
   * `secondaryContainer` and show a check. Assist chip when left out.
   */
  selected?: boolean;
  /** Leading icon of an assist chip. */
  icon?: LucideIcon;
};

/** M3 chip (https://m3.material.io/components/chips): filter or assist. */
export function Chip({ label, selected, icon: Icon, ...props }: ChipProps) {
  const { colors } = useAppTheme();
  const filter = selected !== undefined;
  const content = selected ? colors.onSecondaryContainer : colors.onSurfaceVariant;
  const LeadingIcon = selected ? Check : Icon;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={filter ? { selected } : undefined}
      hitSlop={{ top: SLOP, bottom: SLOP }}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: colors.secondaryContainer }
          : { borderWidth: 1, borderColor: colors.outlineVariant },
        LeadingIcon && styles.withIcon,
      ]}
      {...props}>
      {({ pressed }) => (
        <>
          <StateLayer color={content} pressed={pressed} />
          {LeadingIcon && (
            <LeadingIcon
              // `secondary` instead of M3's `primary`: primary is kept for each screen's main action.
              color={selected ? content : colors.secondary}
              size={18}
              strokeWidth={2.5}
              aria-hidden
            />
          )}
          <ThemedText type="labelLarge" style={{ color: selected ? content : colors.onSurface }}>
            {label}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    paddingHorizontal: Space.lg,
    borderRadius: ComponentShape.chip,
    overflow: 'hidden',
  },
  withIcon: {
    paddingLeft: Space.sm,
  },
});
