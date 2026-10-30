import Check from 'lucide-react-native/icons/check';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useState } from 'react';
import { FlatList, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
 * Field that opens a small modal with a scrollable list of numbers, so values
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
  const theme = useTheme();
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
      <ThemedText type="smallBold">{label}</ThemedText>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${display}`}
        style={({ pressed }) => [
          styles.input,
          { backgroundColor: theme.backgroundElement },
          pressed && styles.pressed,
        ]}>
        <ThemedText themeColor={value === null ? 'textSecondary' : undefined}>{display}</ThemedText>
        <ChevronDown color={theme.textSecondary} size={20} aria-hidden />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Fechar">
          {/* Stops taps on the card from reaching the backdrop. */}
          <Pressable style={[styles.card, { backgroundColor: theme.background }]} onPress={() => {}}>
            <ThemedText type="smallBold" style={styles.title} accessibilityRole="header">
              {label}
            </ThemedText>
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
              style={[styles.list, { borderColor: theme.backgroundSelected }]}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable
                    onPress={() => select(item)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    style={({ pressed }) => [
                      styles.item,
                      selected && { backgroundColor: theme.backgroundSelected },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText
                      type={selected ? 'smallBold' : 'default'}
                      style={selected && styles.selectedText}>
                      {unit ? `${item} ${unit}` : item}
                    </ThemedText>
                    {selected && <Check color={Brand.primary} size={18} aria-hidden />}
                  </Pressable>
                );
              }}
            />
            <Pressable
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
              <ThemedText type="smallBold" style={styles.selectedText}>
                Cancelar
              </ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  input: {
    height: 52,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)' },
      default: { elevation: 8 },
    }),
  },
  title: {
    textAlign: 'center',
    paddingVertical: Spacing.one,
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
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  selectedText: {
    color: Brand.primary,
  },
  cancel: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
});
