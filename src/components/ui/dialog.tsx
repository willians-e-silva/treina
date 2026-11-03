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
      <View style={[styles.scrim, { backgroundColor: withAlpha(colors.scrim, SCRIM_OPACITY) }]}>
        {/*
          Behind the dialog rather than around it: on the web a button role is
          a <button>, and the dialog's own buttons cannot sit inside one.
        */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        />
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.surfaceContainerHigh,
              boxShadow: shadowFor(ComponentElevation.dialog, colors),
            },
          ]}
          accessibilityViewIsModal>
          <ThemedText type="headlineSmall" accessibilityRole="header">
            {title}
          </ThemedText>
          {children}
          {actions && <View style={styles.actions}>{actions}</View>}
        </View>
      </View>
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
