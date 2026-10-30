import { router, Stack, useLocalSearchParams } from 'expo-router';
import Apple from 'lucide-react-native/icons/apple';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import RotateCw from 'lucide-react-native/icons/rotate-cw';
import Search from 'lucide-react-native/icons/search';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatInt } from '@/components/dashboard/format';
import { ThemedText } from '@/components/themed-text';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import { useFoodLog } from '@/context/food-log';
import { useFoodSearch } from '@/hooks/use-food-search';
import { useTheme } from '@/hooks/use-theme';
import { toDateKey } from '@/lib/exercises';
import type { Food } from '@/lib/foods';

export default function SearchFoodScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();
  const { meals } = useFoodLog();
  const meal = meals.find((candidate) => candidate.id === params.meal) ?? meals[0];
  const date = params.date ?? toDateKey(new Date());
  const [query, setQuery] = useState('');
  const { taco, remote, retry } = useFoodSearch(query);
  const searching = query.trim().length > 0;

  // One list for every source. TACO comes first: generic foods are what
  // people log most, and they are instant.
  const data = searching ? [...taco, ...(remote.status === 'done' ? remote.results : [])] : [];

  function openFood(food: Food) {
    router.push({ pathname: '/log-food/[id]', params: { id: food.id, meal: meal?.id, date } });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: meal?.name ?? 'Adicionar alimento',
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
      <FlatList
        data={data}
        keyExtractor={(food) => food.id}
        renderItem={({ item, index }) => (
          <FoodRow
            food={item}
            first={index === 0}
            last={index === data.length - 1}
            onPress={() => openFood(item)}
          />
        )}
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View style={[styles.search, { backgroundColor: theme.backgroundElement }]}>
            <Search color={theme.textSecondary} size={18} aria-hidden />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar alimento ou marca"
              placeholderTextColor={theme.textSecondary}
              autoFocus
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Buscar alimento"
              style={[styles.input, { color: theme.text }]}
            />
          </View>
        }
        ListEmptyComponent={
          !searching ? (
            <View style={styles.empty}>
              <Apple color={theme.backgroundSelected} size={96} strokeWidth={1.5} aria-hidden />
              <ThemedText themeColor="onSurfaceVariant">Busque e adicione alimentos</ThemedText>
            </View>
          ) : remote.status === 'done' || remote.status === 'idle' ? (
            <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" style={styles.notFound}>
              Nenhum alimento encontrado.
            </ThemedText>
          ) : undefined
        }
        ListFooterComponent={
          !searching ? undefined : remote.status === 'loading' ? (
            <ActivityIndicator color={Brand.primary} style={styles.footer} />
          ) : remote.status === 'error' ? (
            <View style={[styles.footer, styles.footerError]}>
              <ThemedText type="bodyMedium" style={styles.error}>
                {remote.message}
              </ThemedText>
              <Pressable
                onPress={retry}
                accessibilityRole="button"
                style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
                <RotateCw color={Brand.primary} size={18} strokeWidth={2.5} aria-hidden />
                <ThemedText type="titleSmall" style={styles.actionText}>
                  Tentar novamente
                </ThemedText>
              </Pressable>
            </View>
          ) : undefined
        }
      />
    </>
  );
}

type FoodRowProps = {
  food: Food;
  /** The first and last rows round their corners so the list reads as one panel. */
  first: boolean;
  last: boolean;
  onPress: () => void;
};

function FoodRow({ food, first, last, onPress }: FoodRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.backgroundElement },
        first && styles.rowFirst,
        last && styles.rowLast,
        pressed && styles.pressed,
      ]}>
      <View
        style={[
          styles.rowInner,
          !first && {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.backgroundSelected,
          },
        ]}>
        <View style={styles.rowText}>
          <ThemedText numberOfLines={2}>{food.name}</ThemedText>
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" numberOfLines={1}>
            {[`${formatInt(food.per100g.kcal)} kcal / 100 g`, food.detail]
              .filter(Boolean)
              .join(' · ')}
          </ThemedText>
        </View>
        <ChevronRight color={theme.textSecondary} size={18} aria-hidden />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 48,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    // Sits a bit above the middle, where the eye lands with the keyboard open.
    paddingBottom: Spacing.six,
  },
  notFound: {
    textAlign: 'center',
    paddingTop: Spacing.three,
  },
  footer: {
    paddingTop: Spacing.three,
  },
  footerError: {
    gap: Spacing.three,
  },
  error: {
    color: Brand.danger,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionText: {
    color: Brand.primary,
  },
  row: {
    paddingHorizontal: Spacing.three,
  },
  rowFirst: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingTop: Spacing.two,
  },
  rowLast: {
    borderBottomLeftRadius: Spacing.four,
    borderBottomRightRadius: Spacing.four,
    paddingBottom: Spacing.two,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
  },
  rowText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.5,
  },
});
