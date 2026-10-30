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

type CatalogState = {
  exercises: Exercise[];
  /** Whether the first page arrived. */
  loaded: boolean;
  /** Cursor of the next page; `undefined` once the last one is loaded. */
  nextCursor?: string;
  hasMore: boolean;
  loading: boolean;
  error?: string;
};

/** ExerciseDB catalog for one category, one page at a time. */
function useCatalog(category: ExerciseCategory) {
  const [catalog, setCatalog] = useState<CatalogState>({
    exercises: [],
    loaded: false,
    hasMore: true,
    loading: true,
  });

  function load(cursor?: string) {
    listExercises(category, cursor).then(
      ({ exercises, nextCursor }) =>
        setCatalog((current) => ({
          exercises: cursor ? [...current.exercises, ...exercises] : exercises,
          loaded: true,
          nextCursor,
          hasMore: !!nextCursor,
          loading: false,
        })),
      (error: Error) =>
        setCatalog((current) => ({ ...current, loading: false, error: error.message })),
    );
  }

  useEffect(() => {
    load();
    // Loads once per modal; `category` comes from the route and never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Loads the next page. After an error only an explicit `retry` loads again,
   * so reaching the end of the list cannot fire a request loop.
   */
  function loadMore({ retry = false } = {}) {
    if (catalog.loading || !catalog.hasMore || (catalog.error && !retry)) return;
    setCatalog((current) => ({ ...current, loading: true, error: undefined }));
    load(catalog.nextCursor);
  }

  return { catalog, loadMore };
}

export default function SearchExerciseScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: ExerciseCategory; date?: string }>();
  const category = params.category === 'strength' ? 'strength' : 'cardio';
  const date = params.date ?? toDateKey(new Date());
  const [query, setQuery] = useState('');
  const [remote, setRemote] = useState<RemoteState>({ status: 'idle' });
  // Ignores responses of searches that were superseded by a newer one.
  const latestSearch = useRef(0);

  const { catalog, loadMore } = useCatalog(category);

  const customName = query.trim();
  // Typing a new term goes back to the catalog until the search is submitted.
  const showSearch = remote.status !== 'idle' && customName.length > 0;
  const data = !showSearch ? catalog.exercises : remote.status === 'done' ? remote.results : [];
  const loading = showSearch ? remote.status === 'loading' : catalog.loading;
  const error = showSearch ? (remote.status === 'error' ? remote.message : undefined) : catalog.error;
  const listReady = showSearch ? remote.status === 'done' : catalog.loaded;

  // Searches ExerciseDB on submit only: the API throttles bursts of requests.
  async function searchRemote() {
    if (!customName) return;
    const id = ++latestSearch.current;
    setRemote({ status: 'loading' });
    try {
      const results = await searchExercises(customName, category);
      if (id === latestSearch.current) setRemote({ status: 'done', query: customName, results });
    } catch (error) {
      if (id === latestSearch.current) {
        setRemote({ status: 'error', message: (error as Error).message });
      }
    }
  }

  function openExercise(exercise: Exercise) {
    router.push({ pathname: '/log-exercise/[id]', params: { id: exercise.id, date } });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: CATEGORY_LABELS[category],
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <FlatList
        data={data}
        keyExtractor={(exercise) => exercise.id}
        renderItem={({ item, index }) => (
          <ExerciseRow
            exercise={item}
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
              onSubmitEditing={searchRemote}
              placeholder="Buscar exercício"
              autoFocus
              autoCorrect={false}
              accessibilityLabel="Buscar exercício"
            />

            {customName.length > 0 && (
              <View style={styles.actions}>
                <TextAction
                  icon={Search}
                  label={`Buscar “${customName}” na ExerciseDB`}
                  onPress={searchRemote}
                />
                <TextAction
                  icon={Plus}
                  label={`Adicionar “${customName}” manualmente`}
                  onPress={() =>
                    router.push({
                      pathname: '/log-exercise/[id]',
                      params: { id: CUSTOM_EXERCISE_ID, name: customName, category, date },
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
  first: boolean;
  last: boolean;
  onPress: () => void;
};

function ExerciseRow({ exercise, first, last, onPress }: ExerciseRowProps) {
  const { colors } = useAppTheme();

  return (
    <ListRow
      title={exercise.name}
      supporting={
        exercise.target
          ? [exercise.target, exercise.equipment].filter(Boolean).join(' · ')
          : undefined
      }
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
