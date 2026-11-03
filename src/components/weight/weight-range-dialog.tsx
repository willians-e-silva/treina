import Check from 'lucide-react-native/icons/check';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { StateLayer } from '@/components/ui/state-layer';
import { WEIGHT_RANGES, type WeightRange } from '@/lib/weight';
import { Shape, Space, useAppTheme } from '@/theme';

/** `30` → `"30 dias"`, `365` → `"1 ano"`. */
export function formatWeightRange(days: WeightRange) {
  return days === 365 ? '1 ano' : `${days} dias`;
}

type WeightRangeDialogProps = {
  value: WeightRange;
  onChange: (range: WeightRange) => void;
  onDismiss: () => void;
};

/** Picks how far back the weight chart goes; closes once one is picked. */
export function WeightRangeDialog({ value, onChange, onDismiss }: WeightRangeDialogProps) {
  const { colors } = useAppTheme();

  return (
    <Dialog
      visible
      title="Período"
      onDismiss={onDismiss}
      actions={<Button label="Cancelar" variant="text" onPress={onDismiss} />}>
      <View accessibilityRole="radiogroup">
        {WEIGHT_RANGES.map((days) => {
          const selected = days === value;
          return (
            <Pressable
              key={days}
              onPress={() => {
                onChange(days);
                onDismiss();
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              style={[styles.item, selected && { backgroundColor: colors.secondaryContainer }]}>
              {({ pressed }) => (
                <>
                  <StateLayer color={colors.onSurface} pressed={pressed} />
                  <ThemedText
                    type={selected ? 'titleMedium' : 'bodyLarge'}
                    themeColor={selected ? 'onSecondaryContainer' : 'onSurface'}>
                    {formatWeightRange(days)}
                  </ThemedText>
                  {selected && <Check color={colors.onSecondaryContainer} size={24} aria-hidden />}
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  item: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    borderRadius: Shape.full,
    overflow: 'hidden',
  },
});
