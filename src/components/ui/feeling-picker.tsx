import type { LucideIcon } from 'lucide-react-native';
import FaceExpressionless from 'lucide-react-native/icons/face-expressionless';
import FaceGrinning from 'lucide-react-native/icons/face-grinning';
import FaceNeutral from 'lucide-react-native/icons/face-neutral';
import FaceSlightlyFrowning from 'lucide-react-native/icons/face-slightly-frowning';
import FaceSlightlySmiling from 'lucide-react-native/icons/face-slightly-smiling';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { StateLayer } from './state-layer';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { FEELING_LABELS, type Feeling } from '@/lib/workouts';
import { MinTouchTarget, Shape, useAppTheme } from '@/theme';

type FaceIcon = LucideIcon | ((props: { color: string; size: number }) => ReactNode);

/**
 * Tired face (closed eyes, frown), drawn like the Lucide faces: Lucide has
 * no tired or sad-enough face for the lowest score.
 */
function FaceTired({ color, size }: { color: string; size: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Circle cx={12} cy={12} r={10} />
      <Path d="M7.5 10q1.25 1 2.5 0" />
      <Path d="M14 10q1.25 1 2.5 0" />
      <Path d="M8 17a5 5 0 0 1 8 0" />
    </Svg>
  );
}

/** From the happiest face (5) down to the tired one (0). */
export const FEELING_ICONS: Record<Feeling, FaceIcon> = {
  5: FaceGrinning,
  4: FaceSlightlySmiling,
  3: FaceNeutral,
  2: FaceExpressionless,
  1: FaceSlightlyFrowning,
  0: FaceTired,
};

/** Left to right: worst to best, like a rating scale. */
const ORDER: Feeling[] = [0, 1, 2, 3, 4, 5];

type FeelingPickerProps = {
  value: Feeling | null;
  onChange: (value: Feeling) => void;
};

/** Row of faces to rate how one feels, with the chosen score's name below. */
export function FeelingPicker({ value, onChange }: FeelingPickerProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.faces} accessibilityRole="radiogroup">
        {ORDER.map((feeling) => {
          const Icon = FEELING_ICONS[feeling];
          const selected = value === feeling;
          const color = selected ? colors.onSecondaryContainer : colors.onSurfaceVariant;
          return (
            <Pressable
              key={feeling}
              onPress={() => onChange(feeling)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${feeling} de 5, ${FEELING_LABELS[feeling]}`}
              style={[styles.face, selected && { backgroundColor: colors.secondaryContainer }]}>
              {({ pressed }) => (
                <>
                  <StateLayer color={colors.onSurface} pressed={pressed} />
                  <Icon color={color} size={32} />
                </>
              )}
            </Pressable>
          );
        })}
      </View>
      <ThemedText
        type="titleMedium"
        themeColor={value === null ? 'onSurfaceVariant' : 'onSurface'}
        style={styles.label}>
        {value === null ? 'Escolha uma carinha' : FEELING_LABELS[value]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  faces: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  face: {
    // An equal share of the row (at least 48dp on a 360dp-wide phone), up to 56dp.
    flex: 1,
    maxWidth: MinTouchTarget + Spacing.two,
    minHeight: MinTouchTarget,
    aspectRatio: 1,
    borderRadius: Shape.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    textAlign: 'center',
  },
});
