import { router, Stack, useLocalSearchParams } from 'expo-router';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import MessageCircle from 'lucide-react-native/icons/message-circle';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { InstagramIcon } from '@/components/ui/instagram-icon';
import { TrainerAvatar } from '@/components/trainers/trainer-avatar';
import { StateLayer } from '@/components/ui/state-layer';
import { Surface } from '@/components/ui/surface';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useCoaching } from '@/context/coaching';
import {
  formatCompact,
  formatRating,
  getTrainer,
  instagramUrl,
  LEVEL_LABELS,
  type TrainingPackage,
} from '@/lib/trainers';
import { ComponentShape, useAppTheme } from '@/theme';

/** A trainer's profile: photo, numbers, bio and the packages they publish. */
export default function TrainerScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trainer = getTrainer(id);

  if (!trainer) {
    return (
      <View style={styles.missing}>
        <ThemedText themeColor="onSurfaceVariant">Treinador não encontrado.</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: trainer.name }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}>
        <View style={styles.profile}>
          <TrainerAvatar name={trainer.name} photoUrl={trainer.photoUrl} size={96} />
          <View style={styles.profileText}>
            <ThemedText type="headlineSmall" emphasized style={styles.center}>
              {trainer.name}
            </ThemedText>
            <ThemedText themeColor="onSurfaceVariant" style={styles.center}>
              {trainer.specialty}
            </ThemedText>
          </View>
          <View style={styles.actions}>
            <Button
              label="Conversar"
              icon={MessageCircle}
              onPress={() =>
                router.push({ pathname: '/chat/[trainerId]', params: { trainerId: trainer.id } })
              }
              accessibilityLabel={`Conversar com ${trainer.name}`}
            />
            <Button
              label={`@${trainer.instagram}`}
              variant="outlined"
              icon={InstagramIcon}
              onPress={() => Linking.openURL(instagramUrl(trainer.instagram))}
              accessibilityRole="link"
              accessibilityLabel={`Instagram de ${trainer.name}, @${trainer.instagram}`}
            />
          </View>
        </View>

        <Surface style={styles.stats}>
          <Stat label="Seguidores" value={formatCompact(trainer.followers)} />
          <Stat label="Alunos" value={formatCompact(trainer.students)} />
          <Stat
            label={`Nota (${formatCompact(trainer.ratingCount)})`}
            value={formatRating(trainer.rating)}
            accessibilityLabel={`Nota ${formatRating(trainer.rating)} de 5, ${trainer.ratingCount} avaliações`}
          />
        </Surface>

        <ThemedText>{trainer.bio}</ThemedText>

        <View style={styles.group}>
          <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
            Pacotes de treinos
          </ThemedText>
          {trainer.packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function Stat({
  label,
  value,
  accessibilityLabel,
}: {
  label: string;
  value: string;
  accessibilityLabel?: string;
}) {
  return (
    <View
      style={styles.stat}
      accessible
      accessibilityLabel={accessibilityLabel ?? `${value} ${label.toLowerCase()}`}>
      <ThemedText type="titleLarge" emphasized>
        {value}
      </ThemedText>
      <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
        {label}
      </ThemedText>
    </View>
  );
}

function PackageCard({ pkg }: { pkg: TrainingPackage }) {
  const { colors } = useAppTheme();
  const joined = useCoaching().isJoined(pkg.id);
  const details = `${LEVEL_LABELS[pkg.level]} · ${pkg.weeks} semanas · ${pkg.workouts.length} ${pkg.workouts.length === 1 ? 'treino' : 'treinos'}`;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/trainer/package/[id]', params: { id: pkg.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${pkg.name}, ${details}${joined ? ', você aderiu' : ''}`}
      style={[styles.package, { backgroundColor: colors.surfaceContainer }]}>
      {({ pressed }) => (
        <>
          <StateLayer color={colors.onSurface} pressed={pressed} />
          <View style={styles.packageText}>
            <ThemedText type="titleMedium" emphasized>
              {pkg.name}
            </ThemedText>
            <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
              {details}
            </ThemedText>
            <ThemedText type="bodyMedium" numberOfLines={2} style={styles.description}>
              {pkg.description}
            </ThemedText>
            {joined && (
              <View style={styles.joined}>
                <CircleCheck color={colors.secondary} size={16} aria-hidden />
                <ThemedText type="labelLarge" themeColor="secondary">
                  Você aderiu
                </ThemedText>
              </View>
            )}
          </View>
          <ChevronRight color={colors.onSurfaceVariant} size={24} aria-hidden />
        </>
      )}
    </Pressable>
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
  profile: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  profileText: {
    alignItems: 'center',
  },
  center: {
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: Spacing.three,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  group: {
    gap: Spacing.three,
  },
  package: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: ComponentShape.card,
    overflow: 'hidden',
  },
  packageText: {
    flex: 1,
    gap: 2,
  },
  description: {
    marginTop: Spacing.one,
  },
  joined: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
});
