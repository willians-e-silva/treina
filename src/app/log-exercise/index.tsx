import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Plus from 'lucide-react-native/icons/plus';
import Search from 'lucide-react-native/icons/search';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  CATEGORY_LABELS,
  CUSTOM_EXERCISE_ID,
  toDateKey,
  type Exercise,
  type ExerciseCategory,
} from '@/lib/exercises';
import { listExercises, searchExercises } from '@/lib/exercisedb';

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
  const theme = useTheme();
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
          headerLeft: () => (
            <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={Spacing.two}>
              <ThemedText style={styles.headerButton}>Cancelar</ThemedText>
            </Pressable>
          ),
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
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.search, { backgroundColor: theme.backgroundElement }]}>
              <Search color={theme.textSecondary} size={18} aria-hidden />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={searchRemote}
                placeholder="Buscar exercício"
                placeholderTextColor={theme.textSecondary}
                autoFocus
                autoCorrect={false}
                returnKeyType="search"
                accessibilityLabel="Buscar exercício"
                style={[styles.input, { color: theme.text }]}
              />
            </View>

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
              <ThemedText type="smallBold" themeColor="textSecondary" accessibilityRole="header">
                {remote.status === 'done' && showSearch
                  ? `Resultados para “${remote.query}”`
                  : 'Exercícios'}
              </ThemedText>
            )}
          </View>
        }
        ListEmptyComponent={
          listReady && !loading ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                {showSearch
                  ? 'Nenhum exercício encontrado. Tente um termo em inglês.'
                  : 'Nenhum exercício encontrado.'}
              </ThemedText>
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {loading && <ActivityIndicator color={Brand.primary} />}
            {error && (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            )}
            {!showSearch && error && catalog.hasMore && (
              <TextAction
                icon={Plus}
                label="Tentar novamente"
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

function TextAction({ icon: Icon, label, onPress }: TextActionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <Icon color={Brand.primary} size={18} strokeWidth={2.5} aria-hidden />
      <ThemedText type="smallBold" style={styles.actionText} numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

type ExerciseRowProps = {
  exercise: Exercise;
  /** The first and last rows round their corners so the list reads as one panel. */
  first: boolean;
  last: boolean;
  onPress: () => void;
};

function ExerciseRow({ exercise, first, last, onPress }: ExerciseRowProps) {
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
        {exercise.gifUrl ? (
          <Image
            source={exercise.gifUrl}
            // First frame only: dozens of animated GIFs would be heavy.
            autoplay={false}
            recyclingKey={exercise.id}
            contentFit="cover"
            style={styles.thumbnail}
            aria-hidden
          />
        ) : (
          <View
            style={[
              styles.thumbnail,
              styles.placeholder,
              { backgroundColor: theme.backgroundSelected },
            ]}>
            <Dumbbell color={theme.textSecondary} size={18} aria-hidden />
          </View>
        )}
        <View style={styles.rowText}>
          <ThemedText numberOfLines={2}>{exercise.name}</ThemedText>
          {exercise.target && (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {[exercise.target, exercise.equipment].filter(Boolean).join(' · ')}
            </ThemedText>
          )}
        </View>
        <ChevronRight color={theme.textSecondary} size={18} aria-hidden />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
  },
  header: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerButton: {
    color: Brand.primary,
    fontWeight: 600,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 48,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  actions: {
    gap: Spacing.three,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionText: {
    flexShrink: 1,
    color: Brand.primary,
  },
  footer: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  error: {
    color: Brand.danger,
  },
  emptyBox: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
  },
  empty: {
    textAlign: 'center',
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
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: Spacing.two,
    backgroundColor: '#ffffff',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.5,
  },
});
