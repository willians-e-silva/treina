import { StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { Surface } from './ui/surface';

import type { MainTab } from '@/constants/tabs';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/theme';

type ComingSoonProps = {
  icon: MainTab['icon'];
  message?: string;
};

/** Discreet notice for screens whose features are not implemented yet. */
export function ComingSoon({
  icon: Icon,
  message = 'Esta funcionalidade será implementada em breve.',
}: ComingSoonProps) {
  const { colors } = useAppTheme();

  return (
    <Surface style={styles.container}>
      <Icon color={colors.onSurfaceVariant} size={32} aria-hidden />
      <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" style={styles.message}>
        {message}
      </ThemedText>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  message: {
    textAlign: 'center',
  },
});
