import { router } from 'expo-router';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { Pressable, StyleSheet, View } from 'react-native';

import { TrainerAvatar } from './trainer-avatar';

import { ThemedText } from '@/components/themed-text';
import { StateLayer } from '@/components/ui/state-layer';
import { Spacing } from '@/constants/theme';
import { useCatalog } from '@/context/catalog';
import type { WorkoutSource } from '@/lib/workouts';
import { MinTouchTarget, Shape, useAppTheme } from '@/theme';

/** Trainer and package a workout was copied from; opens the package. */
export function WorkoutSourceRow({ source }: { source: WorkoutSource }) {
  const { colors } = useAppTheme();
  const found = useCatalog().getPackage(source.packageId);
  if (!found) return null;
  const { trainer, pkg } = found;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/trainer/package/[id]', params: { id: pkg.id } })}
      accessibilityRole="button"
      accessibilityLabel={`Treino de ${trainer.name}, pacote ${pkg.name}`}
      accessibilityHint="Abre o pacote do treinador"
      style={styles.row}>
      {({ pressed }) => (
        <>
          <StateLayer color={colors.onSurface} pressed={pressed} />
          <TrainerAvatar name={trainer.name} photoUrl={trainer.photoUrl} size={32} />
          <View style={styles.text}>
            <ThemedText type="labelLarge" numberOfLines={1}>
              Treino de {trainer.name}
            </ThemedText>
            <ThemedText type="bodySmall" themeColor="onSurfaceVariant" numberOfLines={1}>
              {pkg.name}
            </ThemedText>
          </View>
          <ChevronRight color={colors.onSurfaceVariant} size={20} aria-hidden />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: MinTouchTarget,
    marginHorizontal: -Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Shape.medium,
    overflow: 'hidden',
  },
  text: {
    flex: 1,
  },
});
