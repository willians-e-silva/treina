import { router, Stack } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMealIcon } from '@/components/diary/meal-icons';
import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import { useFoodLog } from '@/context/food-log';
import { useTheme } from '@/hooks/use-theme';
import { PRESET_MEALS } from '@/lib/foods';
import { normalizeText } from '@/lib/taco';

/** Adds and removes the meals shown in the food diary. */
export default function MealsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { meals, addMeal, removeMeal } = useFoodLog();
  const [name, setName] = useState('');

  const available = PRESET_MEALS.filter((preset) => !meals.some((meal) => meal.id === preset.id));
  const trimmed = name.trim();
  const duplicate = meals.some((meal) => normalizeText(meal.name) === normalizeText(trimmed));
  const canAdd = trimmed.length > 0 && !duplicate;

  function addCustom() {
    if (!canAdd) return;
    // Typing the name of a preset adds the preset, with its icon.
    const preset = available.find((meal) => normalizeText(meal.name) === normalizeText(trimmed));
    addMeal(preset ? { presetId: preset.id } : { name: trimmed });
    setName('');
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          // Opaque: since SDK 58 the header is transparent on iOS 26+.
          headerTransparent: false,
          title: 'Refeições',
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              hitSlop={Spacing.two}
              style={({ pressed }) => pressed && styles.pressed}>
              <ChevronLeft color={Brand.primary} size={24} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.group}>
          <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
            No diário
          </ThemedText>
          <Surface style={styles.list}>
            {meals.map((meal, index) => {
              const { icon: Icon, color } = getMealIcon(meal.id);
              // The diary always keeps at least one meal to log foods in.
              const last = meals.length === 1;
              return (
                <View
                  key={meal.id}
                  style={[
                    styles.row,
                    index > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: theme.backgroundSelected,
                    },
                  ]}>
                  <Icon color={color} size={20} aria-hidden />
                  <ThemedText style={styles.rowName} numberOfLines={1}>
                    {meal.name}
                  </ThemedText>
                  <Pressable
                    onPress={() => removeMeal(meal.id)}
                    disabled={last}
                    accessibilityRole="button"
                    accessibilityLabel={`Remover ${meal.name}`}
                    accessibilityState={{ disabled: last }}
                    hitSlop={Spacing.two}
                    style={({ pressed }) => (pressed || last) && styles.pressed}>
                    <Trash color={theme.textSecondary} size={18} />
                  </Pressable>
                </View>
              );
            })}
          </Surface>
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            Alimentos já registrados em uma refeição removida continuam no diário.
          </ThemedText>
        </View>

        {available.length > 0 && (
          <View style={styles.group}>
            <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
              Refeições padrão
            </ThemedText>
            <View style={styles.chips}>
              {available.map((meal) => (
                <Pressable
                  key={meal.id}
                  onPress={() => addMeal({ presetId: meal.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`Adicionar ${meal.name}`}
                  style={({ pressed }) => [
                    styles.chip,
                    { backgroundColor: theme.backgroundElement },
                    pressed && styles.pressed,
                  ]}>
                  <Plus color={Brand.primary} size={16} strokeWidth={2.5} aria-hidden />
                  <ThemedText type="titleSmall">{meal.name}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.group}>
          <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
            Refeição personalizada
          </ThemedText>
          <View style={styles.custom}>
            <TextInput
              value={name}
              onChangeText={setName}
              onSubmitEditing={addCustom}
              placeholder="Nome da refeição"
              placeholderTextColor={theme.textSecondary}
              returnKeyType="done"
              submitBehavior="submit"
              accessibilityLabel="Nome da refeição personalizada"
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
            />
            <Pressable
              onPress={addCustom}
              disabled={!canAdd}
              accessibilityRole="button"
              accessibilityLabel="Adicionar refeição"
              accessibilityState={{ disabled: !canAdd }}
              style={({ pressed }) => [styles.addButton, (!canAdd || pressed) && styles.pressed]}>
              <Plus color={Brand.onPrimary} size={22} strokeWidth={2.5} />
            </Pressable>
          </View>
          {duplicate && (
            <ThemedText type="bodyMedium" style={styles.error}>
              Já existe uma refeição com esse nome.
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
    gap: Spacing.four,
  },
  group: {
    gap: Spacing.two,
  },
  list: {
    paddingVertical: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  rowName: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  custom: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    height: 52,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: Spacing.three,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: Brand.danger,
  },
  pressed: {
    opacity: 0.5,
  },
});
