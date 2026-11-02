import Check from 'lucide-react-native/icons/check';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Button } from './button';
import { Dialog } from './dialog';
import { StateLayer } from './state-layer';

import { ThemedText } from '@/components/themed-text';
import { ComponentShape, Shape, Space, useAppTheme } from '@/theme';

const ITEM_HEIGHT = 48;
/** Rows visible at once; the list scrolls for the rest. */
const VISIBLE_ITEMS = 5;

type PickerFieldProps = {
  label: string;
  /** Values offered, in order. */
  options: number[];
  value: number | null;
  onChange: (value: number) => void;
  /** Shown after the value, e.g. `"anos"`. */
  unit?: string;
  /** Value the list opens on while nothing is selected. */
  initialValue?: number;
  placeholder?: string;
  disabled?: boolean;
};

/**
 * Field that opens a dialog with a scrollable list of numbers, so values
 * like age or height are picked instead of typed.
 */
export function PickerField({
  label,
  options,
  value,
  onChange,
  unit,
  initialValue,
  placeholder = 'Selecionar',
  disabled,
}: PickerFieldProps) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);

  const focused = value ?? initialValue ?? options[0];
  // Centers the current value in the list when it opens.
  const initialIndex = Math.max(
    0,
    Math.min(options.indexOf(focused) - Math.floor(VISIBLE_ITEMS / 2), options.length - VISIBLE_ITEMS),
  );
  const display = value === null ? placeholder : unit ? `${value} ${unit}` : String(value);

  function select(option: number) {
    onChange(option);
    setOpen(false);
  }

  return (
    <View style={styles.field}>
      <ThemedText type="labelLarge" themeColor="onSurfaceVariant">
        {label}
      </ThemedText>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${display}`}
        style={[styles.input, { backgroundColor: colors.surfaceContainerHighest }]}>
        {({ pressed }) => (
          <>
            <StateLayer color={colors.onSurface} pressed={pressed} />
            <ThemedText themeColor={value === null ? 'onSurfaceVariant' : 'onSurface'}>
              {display}
            </ThemedText>
            <ChevronDown color={colors.onSurfaceVariant} size={24} aria-hidden />
          </>
        )}
      </Pressable>

      <Dialog
        visible={open}
        title={label}
        onDismiss={() => setOpen(false)}
        actions={<Button label="Cancelar" variant="text" onPress={() => setOpen(false)} />}>
        <FlatList
          data={options}
          keyExtractor={(option) => String(option)}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          initialScrollIndex={initialIndex}
          showsVerticalScrollIndicator={false}
          style={[styles.list, { borderColor: colors.outlineVariant }]}
          renderItem={({ item }) => {
            const selected = item === value;
            return (
              <Pressable
                onPress={() => select(item)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                style={[styles.item, selected && { backgroundColor: colors.secondaryContainer }]}>
                {({ pressed }) => (
                  <>
                    <StateLayer color={colors.onSurface} pressed={pressed} />
                    <ThemedText
                      type={selected ? 'titleMedium' : 'bodyLarge'}
                      themeColor={selected ? 'onSecondaryContainer' : 'onSurface'}>
                      {unit ? `${item} ${unit}` : item}
                    </ThemedText>
                    {selected && (
                      <Check color={colors.onSecondaryContainer} size={24} aria-hidden />
                    )}
                  </>
                )}
              </Pressable>
            );
          }}
        />
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Space.sm,
  },
  input: {
    height: 56,
    borderRadius: ComponentShape.textField,
    paddingHorizontal: Space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  list: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    flexGrow: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  item: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    borderRadius: Shape.full,
    overflow: 'hidden',
  },
});
