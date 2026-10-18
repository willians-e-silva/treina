import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type ProgressBarProps = {
  /** Fraction filled, clamped to 0–1. */
  progress: number;
  color: string;
};

/** Thin horizontal progress bar. */
export function ProgressBar({ progress, color }: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
