import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Star from 'lucide-react-native/icons/star';
import Users from 'lucide-react-native/icons/users';
import { Pressable, StyleSheet, View } from 'react-native';

import { TrainerAvatar } from './trainer-avatar';

import { ThemedText } from '@/components/themed-text';
import { StateLayer } from '@/components/ui/state-layer';
import { Spacing } from '@/constants/theme';
import { formatCompact, formatRating, type Trainer } from '@/lib/trainers';
import { ComponentShape, useAppTheme } from '@/theme';

/** Photo, name, followers and rating of a trainer; opens their profile. */
export function TrainerCard({ trainer, onPress }: { trainer: Trainer; onPress: () => void }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${trainer.name}, ${trainer.specialty}, ${formatCompact(trainer.followers)} seguidores, nota ${formatRating(trainer.rating)} de 5`}
      style={[styles.card, { backgroundColor: colors.surfaceContainer }]}>
      {({ pressed }) => (
        <>
          <StateLayer color={colors.onSurface} pressed={pressed} />
          <TrainerAvatar name={trainer.name} photoUrl={trainer.photoUrl} size={64} />
          <View style={styles.text}>
            <ThemedText type="titleMedium" emphasized numberOfLines={1}>
              {trainer.name}
            </ThemedText>
            <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" numberOfLines={1}>
              {trainer.specialty}
            </ThemedText>
            <View style={styles.stats}>
              <TrainerStat icon="followers" value={`${formatCompact(trainer.followers)} seguidores`} />
              <TrainerStat icon="rating" value={formatRating(trainer.rating)} />
            </View>
          </View>
          <ChevronRight color={colors.onSurfaceVariant} size={24} aria-hidden />
        </>
      )}
    </Pressable>
  );
}

/** Small icon + value; the star of the rating is filled. */
function TrainerStat({ icon, value }: { icon: 'followers' | 'rating'; value: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.stat}>
      {icon === 'rating' ? (
        <Star color={colors.tertiary} fill={colors.tertiary} size={16} aria-hidden />
      ) : (
        <Users color={colors.onSurfaceVariant} size={16} aria-hidden />
      )}
      <ThemedText type="labelLarge" themeColor="onSurfaceVariant">
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: ComponentShape.card,
    overflow: 'hidden',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.three,
    rowGap: 2,
    marginTop: Spacing.one,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
