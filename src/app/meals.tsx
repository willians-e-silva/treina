import { Stack } from 'expo-router';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMealIcon } from '@/components/diary/meal-icons';
import { ThemedText } from '@/components/themed-text';
import { Chip } from '@/components/ui/chip';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import { IconButton } from '@/components/ui/icon-button';
import { Surface } from '@/components/ui/surface';
import { ThemedTextInput } from '@/components/ui/text-input';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useFoodLog } from '@/context/food-log';
import { PRESET_MEALS, type Meal } from '@/lib/foods';
import { normalizeText } from '@/lib/taco';
import { useAppTheme } from '@/theme';

/** Adds and removes the meals shown in the food diary. */
export default function MealsScreen() {
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
          title: 'Refeições',
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.group}>
          <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
            No diário
          </ThemedText>
          <Surface style={styles.list}>
            {meals.map((meal, index) => (
              <MealRow
                key={meal.id}
                meal={meal}
                divider={index > 0}
                // The diary always keeps at least one meal to log foods in.
                removable={meals.length > 1}
                onRemove={() => removeMeal(meal.id)}
              />
            ))}
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
                <Chip
                  key={meal.id}
                  label={meal.name}
                  icon={Plus}
                  onPress={() => addMeal({ presetId: meal.id })}
                  accessibilityLabel={`Adicionar ${meal.name}`}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.group}>
          <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
            Refeição personalizada
          </ThemedText>
          <View style={styles.custom}>
            <ThemedTextInput
              value={name}
              onChangeText={setName}
              onSubmitEditing={addCustom}
              placeholder="Nome da refeição"
              returnKeyType="done"
              submitBehavior="submit"
              accessibilityLabel="Nome da refeição personalizada"
              style={styles.input}
            />
            <IconButton
              icon={Plus}
              variant="filled"
              onPress={addCustom}
              disabled={!canAdd}
              accessibilityLabel="Adicionar refeição"
            />
          </View>
          {duplicate && (
            <ThemedText type="bodyMedium" themeColor="error">
              Já existe uma refeição com esse nome.
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function MealRow({
  meal,
  divider,
  removable,
  onRemove,
}: {
  meal: Meal;
  divider: boolean;
  removable: boolean;
  onRemove: () => void;
}) {
  const { colors } = useAppTheme();
  const { icon: Icon, color } = useMealIcon(meal.id);

  return (
    <View
      style={[
        styles.row,
        divider && {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.outlineVariant,
        },
      ]}>
      <Icon color={color} size={24} aria-hidden />
      <ThemedText style={styles.rowName} numberOfLines={1}>
        {meal.name}
      </ThemedText>
      <IconButton
        icon={Trash}
        onPress={onRemove}
        disabled={!removable}
        accessibilityLabel={`Remover ${meal.name}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
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
    paddingVertical: Spacing.one,
  },
  rowName: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  custom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
  },
});
