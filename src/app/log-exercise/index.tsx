import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Plus from 'lucide-react-native/icons/plus';
import Search from 'lucide-react-native/icons/search';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/ui/header-back-button';
import { ListRow } from '@/components/ui/list-row';
import { SearchBar } from '@/components/ui/search-bar';
import { SegmentedButtons } from '@/components/ui/segmented-buttons';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  CATEGORY_LABELS,
  CUSTOM_EXERCISE_ID,
  toDateKey,
  type Exercise,
  type ExerciseCategory,
} from '@/lib/exercises';
import { listExercises, searchExercises } from '@/lib/exercisedb';
import { ComponentShape, MediaColors, useAppTheme } from '@/theme';

type RemoteState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; query: string; results: Exercise[] }
  | { status: 'error'; message: string };

/** Exercises shown: both categories, or only one. */
type Filter = 'all' | ExerciseCategory;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'cardio', label: CATEGORY_LABELS.cardio },
  { value: 'strength', label: CATEGORY_LABELS.strength },
];

const categoryOf = (filter: Filter) => (filter === 'all' ? undefined : filter);

type CatalogState = {
  filter: Filter;
  exercises: Exercise[];
  /** Whether the first page arrived. */
  loaded: boolean;
  /** Cursor of the next page; `undefined` once the last one is loaded. */
  nextCursor?: string;
  hasMore: boolean;
  loading: boolean;
  error?: string;
};

const firstPage = (filter: Filter): CatalogState => ({
  filter,
  exercises: [],
  loaded: false,
  hasMore: true,
  loading: true,
});

/** ExerciseDB catalog for the filter, one page at a time. */
function useCatalog(initialFilter: Filter) {
  const [catalog, setCatalog] = useState(() => firstPage(initialFilter));

  function load(filter: Filter, cursor?: string) {
    listExercises(categoryOf(filter), cursor).then(
      ({ exercises, nextCursor }) =>
        setCatalog((current) =>
          // Pages of a filter that was changed meanwhile are dropped.
          current.filter !== filter
            ? current
            : {
                filter,
                exercises: cursor ? [...current.exercises, ...exercises] : exercises,
                loaded: true,
                nextCursor,
                hasMore: !!nextCursor,
                loading: false,
              },
        ),
      (error: Error) =>
        setCatalog((current) =>
          current.filter !== filter
            ? current
            : { ...current, loading: false, error: error.message },
        ),
    );
  }

  useEffect(() => {
    load(initialFilter);
    // Loads the first page once; changing the filter loads through `setFilter`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Starts the catalog over for another filter. */
  function setFilter(filter: Filter) {
    if (filter === catalog.filter) return;
    setCatalog(firstPage(filter));
    load(filter);
  }

  /**
   * Loads the next page. After an error only an explicit `retry` loads again,
   * so reaching the end of the list cannot fire a request loop.
   */
  function loadMore({ retry = false } = {}) {
    if (catalog.loading || !catalog.hasMore || (catalog.error && !retry)) return;
    setCatalog((current) => ({ ...current, loading: true, error: undefined }));
    load(catalog.filter, catalog.nextCursor);
  }

  return { catalog, loadMore, setFilter };
}

export default function SearchExerciseScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    category?: ExerciseCategory;
    date?: string;
    /** Set when choosing an exercise for a workout instead of logging it. */
    workoutId?: string;
  }>();
  const date = params.date ?? toDateKey(new Date());
  const { workoutId } = params;
  const [query, setQuery] = useState('');
  const [remote, setRemote] = useState<RemoteState>({ status: 'idle' });
  // Ignores responses of searches that were superseded by a newer one.
  const latestSearch = useRef(0);

  const { catalog, loadMore, setFilter } = useCatalog(
    params.category === 'cardio' || params.category === 'strength' ? params.category : 'all',
  );
  const { filter } = catalog;

  const customName = query.trim();
  // Typing a new term goes back to the catalog until the search is submitted.
  const showSearch = remote.status !== 'idle' && customName.length > 0;
  const data = !showSearch ? catalog.exercises : remote.status === 'done' ? remote.results : [];
  const loading = showSearch ? remote.status === 'loading' : catalog.loading;
  const error = showSearch ? (remote.status === 'error' ? remote.message : undefined) : catalog.error;
  const listReady = showSearch ? remote.status === 'done' : catalog.loaded;

  // Searches ExerciseDB on submit only: the API throttles bursts of requests.
  async function searchRemote(searchFilter = filter) {
    if (!customName) return;
    const id = ++latestSearch.current;
    setRemote({ status: 'loading' });
    try {
      const results = await searchExercises(customName, categoryOf(searchFilter));
      if (id === latestSearch.current) setRemote({ status: 'done', query: customName, results });
    } catch (error) {
      if (id === latestSearch.current) {
        setRemote({ status: 'error', message: (error as Error).message });
      }
    }
  }

  function changeFilter(next: Filter) {
    setFilter(next);
    // A search on screen is run again for the new filter.
    if (showSearch) void searchRemote(next);
  }

  function openExercise(exercise: Exercise) {
    router.push({ pathname: '/log-exercise/[id]', params: { id: exercise.id, date, workoutId } });
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <FlatList
        data={data}
        keyExtractor={(exercise) => exercise.id}
        renderItem={({ item, index }) => (
          <ExerciseRow
            exercise={item}
            showCategory={filter === 'all'}
            first={index === 0}
            last={index === data.length - 1}
            onPress={() => openExercise(item)}
          />
        )}
        // Lazy loading: the next catalog page loads as the end of the list gets close.
        onEndReached={showSearch ? undefined : () => loadMore()}
        onEndReachedThreshold={0.5}
        style={styles.list}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View style={styles.header}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => searchRemote()}
              placeholder="Buscar exercício"
              autoFocus
              autoCorrect={false}
              accessibilityLabel="Buscar exercício"
            />
            <SegmentedButtons
              options={FILTERS}
              value={filter}
              onChange={changeFilter}
              borderWidth={3}
            />

            {customName.length > 0 && (
              <View style={styles.actions}>
                <TextAction
                  icon={Search}
                  label={`Buscar “${customName}” na ExerciseDB`}
                  onPress={() => searchRemote()}
                />
                <TextAction
                  icon={Plus}
                  label={`Adicionar “${customName}” manualmente`}
                  onPress={() =>
                    router.push({
                      pathname: '/log-exercise/[id]',
                      params: {
                        id: CUSTOM_EXERCISE_ID,
                        name: customName,
                        category: categoryOf(filter),
                        date,
                        workoutId,
                      },
                    })
                  }
                />
              </View>
            )}

            {listReady && (
              <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
                {remote.status === 'done' && showSearch
                  ? `Resultados para “${remote.query}”`
                  : 'Exercícios'}
              </ThemedText>
            )}
          </View>
        }
        ListEmptyComponent={
          listReady && !loading ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.surfaceContainer }]}>
              <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" style={styles.empty}>
                {showSearch
                  ? 'Nenhum exercício encontrado. Tente um termo em inglês.'
                  : 'Nenhum exercício encontrado.'}
              </ThemedText>
            </View>
          ) : undefined
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {loading && <ActivityIndicator color={colors.primary} />}
            {error && (
              <ThemedText type="bodyMedium" themeColor="error">
                {error}
              </ThemedText>
            )}
            {!showSearch && error && catalog.hasMore && (
              <Button
                label="Tentar novamente"
                variant="tonal"
                icon={Plus}
                onPress={() => loadMore({ retry: true })}
              />
            )}
          </View>
        }
      />
    </>
  );
}

type TextActionProps = {
  icon: typeof Plus;
  label: string;
  onPress: () => void;
};

/** Low-emphasis action under the search bar (M3 text button). */
function TextAction({ icon, label, onPress }: TextActionProps) {
  return <Button label={label} variant="text" tone="secondary" icon={icon} onPress={onPress} />;
}

type ExerciseRowProps = {
  exercise: Exercise;
  /** Names the category, when the list mixes both. */
  showCategory: boolean;
  first: boolean;
  last: boolean;
  onPress: () => void;
};

function ExerciseRow({ exercise, showCategory, first, last, onPress }: ExerciseRowProps) {
  const { colors } = useAppTheme();
  const supporting = [
    showCategory && CATEGORY_LABELS[exercise.category],
    exercise.target,
    exercise.target && exercise.equipment,
  ].filter(Boolean);

  return (
    <ListRow
      title={exercise.name}
      supporting={supporting.length > 0 ? supporting.join(' · ') : undefined}
      first={first}
      last={last}
      onPress={onPress}
      leading={
        exercise.gifUrl ? (
          <Image
            source={exercise.gifUrl}
            // First frame only: dozens of animated GIFs would be heavy.
            autoplay={false}
            recyclingKey={exercise.id}
            contentFit="cover"
            style={[styles.thumbnail, { backgroundColor: MediaColors.exerciseGif }]}
            aria-hidden
          />
        ) : (
          <View
            style={[
              styles.thumbnail,
              styles.placeholder,
              { backgroundColor: colors.surfaceContainerHighest },
            ]}>
            <Dumbbell color={colors.onSurfaceVariant} size={24} aria-hidden />
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
  },
  header: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  actions: {
    gap: Spacing.one,
  },
  footer: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  emptyBox: {
    borderRadius: ComponentShape.card,
    padding: Spacing.three,
  },
  empty: {
    textAlign: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: ComponentShape.listItemImage,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
