import { router, Stack, useLocalSearchParams } from 'expo-router';
import Apple from 'lucide-react-native/icons/apple';
import RotateCw from 'lucide-react-native/icons/rotate-cw';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatInt } from '@/components/dashboard/format';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import { ListRow } from '@/components/ui/list-row';
import { SearchBar } from '@/components/ui/search-bar';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useFoodLog } from '@/context/food-log';
import { useFoodSearch } from '@/hooks/use-food-search';
import { toDateKey } from '@/lib/exercises';
import type { Food } from '@/lib/foods';
import { useAppTheme } from '@/theme';

export default function SearchFoodScreen() {
  const { colors } = useAppTheme();
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
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <FlatList
        data={data}
        keyExtractor={(food) => food.id}
        renderItem={({ item, index }) => (
          <ListRow
            title={item.name}
            supporting={[`${formatInt(item.per100g.kcal)} kcal / 100 g`, item.detail]
              .filter(Boolean)
              .join(' · ')}
            first={index === 0}
            last={index === data.length - 1}
            onPress={() => openFood(item)}
          />
        )}
        style={styles.list}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar alimento ou marca"
            autoFocus
            autoCorrect={false}
            accessibilityLabel="Buscar alimento"
            style={styles.search}
          />
        }
        ListEmptyComponent={
          !searching ? (
            <View style={styles.empty}>
              <Apple color={colors.outlineVariant} size={96} strokeWidth={1.5} aria-hidden />
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
            <ActivityIndicator color={colors.primary} style={styles.footer} />
          ) : remote.status === 'error' ? (
            <View style={[styles.footer, styles.footerError]}>
              <ThemedText type="bodyMedium" themeColor="error">
                {remote.message}
              </ThemedText>
              <Button label="Tentar novamente" variant="tonal" icon={RotateCw} onPress={retry} />
            </View>
          ) : undefined
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
  },
  search: {
    marginBottom: Spacing.three,
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
});
