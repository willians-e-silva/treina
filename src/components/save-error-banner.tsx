import RotateCw from 'lucide-react-native/icons/rotate-cw';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useUserDataStatus } from '@/hooks/use-user-data-status';
import { ComponentElevation, shadowFor, useAppTheme } from '@/theme';

/**
 * Shown over every screen while a change could not be saved (e.g. no
 * connection). The change stays on screen; "Tentar novamente" sends it again.
 */
export function SaveErrorBanner() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { saveFailed, retrySave } = useUserDataStatus();
  if (!saveFailed) return null;

  return (
    <View style={[styles.wrapper, { top: insets.top + Spacing.two }]} pointerEvents="box-none">
      <Surface
        style={[styles.banner, { boxShadow: shadowFor(ComponentElevation.dialog, colors) }]}
        accessibilityRole="alert">
        <ThemedText type="bodyMedium" themeColor="error" style={styles.text}>
          Não foi possível salvar suas alterações. Verifique sua conexão.
        </ThemedText>
        <Button label="Tentar novamente" variant="tonal" icon={RotateCw} onPress={retrySave} />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 900,
  },
  banner: {
    gap: Spacing.two,
  },
  text: {
    flexShrink: 1,
  },
});
