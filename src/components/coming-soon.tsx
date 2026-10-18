import { StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { Surface } from './ui/surface';

import type { MainTab } from '@/constants/tabs';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ComingSoonProps = {
  icon: MainTab['icon'];
  message?: string;
};

/** Discreet notice for screens whose features are not implemented yet. */
export function ComingSoon({
  icon: Icon,
  message = 'Esta funcionalidade será implementada em breve.',
}: ComingSoonProps) {
  const theme = useTheme();

  return (
    <Surface style={styles.container}>
      <Icon color={theme.textSecondary} size={32} aria-hidden />
      <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
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
