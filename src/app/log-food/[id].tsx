import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatDecimal, formatInt } from '@/components/dashboard/format';
import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Brand, MaxContentWidth, Nutrition, Spacing } from '@/constants/theme';
import { useFoodLog } from '@/context/food-log';
import { useTheme } from '@/hooks/use-theme';
import { toDateKey } from '@/lib/exercises';
import {
  getFood,
  scaleNutrients,
} from '@/lib/foods';

/** Parses user input like "12", "12,5" or "12.5"; `NaN` when invalid. */
function parseNumber(text: string) {
  return text.trim() === '' ? NaN : Number(text.replace(',', '.'));
}

export default function FoodDetailsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { addEntry, meals } = useFoodLog();
  const params = useLocalSearchParams<{ id: string; date?: string; meal?: string }>();
  const food = getFood(params.id);
  const date = params.date ?? toDateKey(new Date());

  const [mealId, setMealId] = useState(params.meal);
  const meal = meals.find((candidate) => candidate.id === mealId) ?? meals[0];
  const [grams, setGrams] = useState(() => String(food?.servingGrams ?? 100));

  if (!food) {
    // Products found online are only kept in memory, e.g. lost after a reload.
    return (
      <View style={[styles.missing, { backgroundColor: theme.background }]}>
        <ThemedText themeColor="textSecondary">Alimento não encontrado. Busque novamente.</ThemedText>
      </View>
    );
  }

  const gramsValue = parseNumber(grams);
  const valid = gramsValue > 0 && !!meal;
  const nutrients = scaleNutrients(food.per100g, valid ? gramsValue : 0);
  const presets = [
    ...(food.servingGrams ? [{ label: `1 porção (${formatInt(food.servingGrams)} g)`, grams: food.servingGrams }] : []),
    { label: '100 g', grams: 100 },
  ];

  function save() {
    if (!food || !valid) return;
    addEntry({
      date,
      meal: meal.id,
      mealName: meal.name,
      foodId: food.id,
      source: food.source,
      name: food.name,
      detail: food.detail,
      grams: gramsValue,
      nutrients,
    });
    // Close the whole modal (search + quantity), back to the diary.
    navigation.getParent()?.goBack();
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
      keyboardShouldPersistTaps="handled">
      <View>
        <ThemedText style={styles.name} accessibilityRole="header">
          {food.name}
        </ThemedText>
        {food.detail && (
          <ThemedText type="small" themeColor="textSecondary">
            {food.detail}
          </ThemedText>
        )}
      </View>

      <Surface style={styles.form}>
        <View style={styles.fieldRow}>
          <ThemedText style={styles.fieldLabel}>Quantidade (g)</ThemedText>
          <TextInput
            value={grams}
            onChangeText={setGrams}
            keyboardType="decimal-pad"
            selectTextOnFocus
            accessibilityLabel="Quantidade em gramas"
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSelected }]}
          />
        </View>
        <View style={styles.chips}>
          {presets.map((preset) => (
            <Chip
              key={preset.label}
              label={preset.label}
              selected={gramsValue === preset.grams}
              onPress={() => setGrams(String(preset.grams))}
            />
          ))}
        </View>

        <View style={styles.field}>
          <ThemedText>Refeição</ThemedText>
          <View style={styles.chips}>
            {meals.map((option) => (
              <Chip
                key={option.id}
                label={option.name}
                selected={meal?.id === option.id}
                onPress={() => setMealId(option.id)}
              />
            ))}
          </View>
        </View>
      </Surface>

      <Surface style={styles.nutrients}>
        <Nutrient label="Calorias" value={`${formatInt(nutrients.kcal)} kcal`} color={Nutrition.calories} />
        <Nutrient label="Carboidratos" value={`${formatDecimal(nutrients.carbs)} g`} color={Nutrition.carbs} />
        <Nutrient label="Proteínas" value={`${formatDecimal(nutrients.protein)} g`} color={Nutrition.protein} />
        <Nutrient label="Gorduras" value={`${formatDecimal(nutrients.fat)} g`} color={Nutrition.fat} />
        {nutrients.fiber !== undefined && (
          <Nutrient label="Fibras" value={`${formatDecimal(nutrients.fiber)} g`} />
        )}
      </Surface>

      <Pressable
        onPress={save}
        disabled={!valid}
        accessibilityRole="button"
        accessibilityState={{ disabled: !valid }}
        style={({ pressed }) => [styles.save, (!valid || pressed) && styles.pressed]}>
        <ThemedText style={styles.saveText}>Adicionar</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function Chip({ label, selected, onPress }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? Brand.primary : theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="smallBold" style={selected ? styles.chipTextSelected : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function Nutrient({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.nutrient}>
      <View style={styles.nutrientLabel}>
        {color && <View style={[styles.dot, { backgroundColor: color }]} />}
        <ThemedText>{label}</ThemedText>
      </View>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
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
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  name: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: 700,
  },
  form: {
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  fieldLabel: {
    flex: 1,
  },
  input: {
    width: 120,
    height: 44,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    textAlign: 'right',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chipTextSelected: {
    color: Brand.onPrimary,
  },
  nutrients: {
    gap: Spacing.two + Spacing.one,
    paddingVertical: Spacing.four,
  },
  nutrient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nutrientLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  save: {
    height: 52,
    borderRadius: Spacing.three,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: Brand.onPrimary,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.5,
  },
});
