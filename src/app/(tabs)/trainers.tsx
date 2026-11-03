import { router } from 'expo-router';
import UserRoundSearch from 'lucide-react-native/icons/user-round-search';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { TabScreen } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { TrainerCard } from '@/components/trainers/trainer-card';
import { SearchBar } from '@/components/ui/search-bar';
import { Spacing } from '@/constants/theme';
import { useCatalog } from '@/context/catalog';
import { useAppTheme } from '@/theme';

export default function TrainersScreen() {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState('');
  const trainers = useCatalog().searchTrainers(query);

  return (
    <TabScreen>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar treinador pelo nome"
        accessibilityLabel="Buscar treinador pelo nome"
        autoCorrect={false}
      />

      {trainers.length === 0 ? (
        <View style={styles.empty}>
          <UserRoundSearch color={colors.outlineVariant} size={96} strokeWidth={1.5} aria-hidden />
          <ThemedText themeColor="onSurfaceVariant" style={styles.emptyText}>
            Nenhum treinador encontrado para “{query.trim()}”.
          </ThemedText>
        </View>
      ) : (
        trainers.map((trainer) => (
          <TrainerCard
            key={trainer.id}
            trainer={trainer}
            onPress={() => router.push({ pathname: '/trainer/[id]', params: { id: trainer.id } })}
          />
        ))
      )}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.six,
  },
  emptyText: {
    textAlign: 'center',
  },
});
