import { StyleSheet, View } from 'react-native';

import { Shape, useAppTheme } from '@/theme';

type ProgressBarProps = {
  /** Fraction filled, clamped to 0–1. */
  progress: number;
  color: string;
};

/** Thin horizontal progress bar. */
export function ProgressBar({ progress, color }: ProgressBarProps) {
  const { colors } = useAppTheme();
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceContainerHighest }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: Shape.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Shape.full,
  },
});
