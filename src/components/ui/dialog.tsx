import type { PropsWithChildren, ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ComponentElevation, ComponentShape, shadowFor, Space, useAppTheme, withAlpha } from '@/theme';

/** M3 scrim opacity behind dialogs. */
const SCRIM_OPACITY = 0.32;

type DialogProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  onDismiss: () => void;
  /** Buttons aligned to the end, usually text buttons. */
  actions?: ReactNode;
}>;

/**
 * M3 basic dialog: `surfaceContainerHigh` container with 28dp corners over a
 * scrim. Tapping the scrim or the back button dismisses it.
 */
export function Dialog({ visible, title, onDismiss, actions, children }: DialogProps) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        style={[styles.scrim, { backgroundColor: withAlpha(colors.scrim, SCRIM_OPACITY) }]}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Fechar">
        {/* Stops taps on the dialog from reaching the scrim. */}
        <Pressable
          style={[
            styles.dialog,
            {
              backgroundColor: colors.surfaceContainerHigh,
              boxShadow: shadowFor(ComponentElevation.dialog, colors),
            },
          ]}
          onPress={() => {}}
          accessibilityViewIsModal>
          <ThemedText type="headlineSmall" accessibilityRole="header">
            {title}
          </ThemedText>
          {children}
          {actions && <View style={styles.actions}>{actions}</View>}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.xl,
  },
  dialog: {
    width: '100%',
    minWidth: 280,
    maxWidth: 560,
    borderRadius: ComponentShape.dialog,
    padding: Space.xl,
    gap: Space.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Space.sm,
  },
});
