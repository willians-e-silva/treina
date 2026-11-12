import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onDismiss: () => void;
};

/** Asks before a change that cannot be undone, e.g. deleting a workout. */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onDismiss,
}: ConfirmDialogProps) {
  return (
    <Dialog
      visible={visible}
      title={title}
      onDismiss={onDismiss}
      actions={
        <>
          <Button label="Cancelar" variant="text" onPress={onDismiss} />
          <Button
            label={confirmLabel}
            variant="text"
            tone="error"
            onPress={() => {
              onDismiss();
              onConfirm();
            }}
          />
        </>
      }>
      <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
        {message}
      </ThemedText>
    </Dialog>
  );
}
