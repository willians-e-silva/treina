import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatDecimal, formatInt } from '@/components/dashboard/format';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Surface } from '@/components/ui/surface';
import { ThemedTextInput } from '@/components/ui/text-input';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useFoodLog } from '@/context/food-log';
import { toDateKey } from '@/lib/exercises';
import { getFood, scaleNutrients } from '@/lib/foods';
import { Shape, useAppTheme } from '@/theme';

/** Parses user input like "12", "12,5" or "12.5"; `NaN` when invalid. */
function parseNumber(text: string) {
  return text.trim() === '' ? NaN : Number(text.replace(',', '.'));
}

export default function FoodDetailsScreen() {
  const { custom } = useAppTheme();
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
      <View style={styles.missing}>
        <ThemedText themeColor="onSurfaceVariant">Alimento não encontrado. Busque novamente.</ThemedText>
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
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
      keyboardShouldPersistTaps="handled">
      <View>
        <ThemedText type="headlineSmall" emphasized accessibilityRole="header">
          {food.name}
        </ThemedText>
        {food.detail && (
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {food.detail}
          </ThemedText>
        )}
      </View>

      <Surface style={styles.form}>
        <View style={styles.fieldRow}>
          <ThemedText style={styles.fieldLabel}>Quantidade (g)</ThemedText>
          <ThemedTextInput
            size="compact"
            value={grams}
            onChangeText={setGrams}
            keyboardType="decimal-pad"
            selectTextOnFocus
            accessibilityLabel="Quantidade em gramas"
            style={styles.input}
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
          <ThemedText type="labelLarge" themeColor="onSurfaceVariant">
            Refeição
          </ThemedText>
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
        <Nutrient label="Calorias" value={`${formatInt(nutrients.kcal)} kcal`} color={custom.diet.color} />
        <Nutrient label="Carboidratos" value={`${formatDecimal(nutrients.carbs)} g`} color={custom.carbs.color} />
        <Nutrient label="Proteínas" value={`${formatDecimal(nutrients.protein)} g`} color={custom.protein.color} />
        <Nutrient label="Gorduras" value={`${formatDecimal(nutrients.fat)} g`} color={custom.fat.color} />
        {nutrients.fiber !== undefined && (
          <Nutrient label="Fibras" value={`${formatDecimal(nutrients.fiber)} g`} />
        )}
      </Surface>

      <Button label="Adicionar" size="medium" fullWidth onPress={save} disabled={!valid} />
    </ScrollView>
  );
}

function Nutrient({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.nutrient}>
      <View style={styles.nutrientLabel}>
        {color && <View style={[styles.dot, { backgroundColor: color }]} />}
        <ThemedText>{label}</ThemedText>
      </View>
      <ThemedText type="titleMedium">{value}</ThemedText>
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
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
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
    textAlign: 'right',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
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
    width: 12,
    height: 12,
    borderRadius: Shape.full,
  },
});
