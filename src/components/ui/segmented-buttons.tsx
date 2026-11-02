import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { StateLayer } from './state-layer';

import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Shape, Space, useAppTheme } from '@/theme';

type SegmentedButtonsProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * M3 segmented buttons for a single choice: outlined pill segments, the
 * selected one filled with `secondaryContainer`.
 */
export function SegmentedButtons<T extends string>({
  options,
  value,
  onChange,
  disabled,
  style,
}: SegmentedButtonsProps<T>) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[styles.group, { borderColor: colors.outline }, style]}
      accessibilityRole="radiogroup">
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            style={[
              styles.segment,
              index > 0 && { borderLeftWidth: 1, borderLeftColor: colors.outline },
              selected && { backgroundColor: colors.secondaryContainer },
            ]}>
            {({ pressed }) => (
              <>
                <StateLayer color={colors.onSurface} pressed={pressed} />
                <ThemedText
                  type="labelLarge"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  themeColor={selected ? 'onSecondaryContainer' : 'onSurface'}>
                  {option.label}
                </ThemedText>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    height: MinTouchTarget,
    borderRadius: Shape.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.sm,
  },
});
