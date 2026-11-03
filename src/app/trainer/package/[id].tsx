import { router, Stack, useLocalSearchParams } from 'expo-router';
import ClipboardList from 'lucide-react-native/icons/clipboard-list';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import LogOut from 'lucide-react-native/icons/log-out';
import Star from 'lucide-react-native/icons/star';
import UserPlus from 'lucide-react-native/icons/user-plus';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { TrainerAvatar } from '@/components/trainers/trainer-avatar';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { StateLayer } from '@/components/ui/state-layer';
import { Surface } from '@/components/ui/surface';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useCatalog } from '@/context/catalog';
import { useCoaching } from '@/context/coaching';
import { fromDateKey } from '@/lib/exercises';
import {
  formatRating,
  LEVEL_LABELS,
  type PackageComment,
  type PackageWorkout,
} from '@/lib/trainers';
import { ComponentShape, useAppTheme } from '@/theme';

const commentDate = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** A trainer's package: its workouts and exercises, the comments, and joining it. */
export default function PackageScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { joinedPackageId, isJoined, joinPackage, leavePackage } = useCoaching();
  const [confirmReplace, setConfirmReplace] = useState(false);
  const { getPackage } = useCatalog();
  const found = getPackage(id);
  const current = joinedPackageId ? getPackage(joinedPackageId) : undefined;

  if (!found) {
    return (
      <View style={styles.missing}>
        <ThemedText themeColor="onSurfaceVariant">Pacote não encontrado.</ThemedText>
      </View>
    );
  }

  const { trainer, pkg } = found;
  const joined = isJoined(pkg.id);
  const average =
    pkg.comments.length > 0
      ? pkg.comments.reduce((sum, comment) => sum + comment.rating, 0) / pkg.comments.length
      : undefined;

  function join() {
    // Only one package at a time: joining another replaces the current plan.
    if (current) setConfirmReplace(true);
    else confirmJoin();
  }

  /**
   * Joins and opens the new plan over the Exercícios tab, where its Confirmar
   * button leads back.
   */
  function confirmJoin() {
    joinPackage(pkg);
    router.dismissTo('/exercise');
    router.push('/workouts');
  }

  return (
    <>
      <Stack.Screen options={{ title: pkg.name }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Spacing.four }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={`Pacote de ${trainer.name}. Voltar ao perfil`}
          style={styles.trainer}>
          {({ pressed }) => (
            <>
              <StateLayer color={colors.onSurface} pressed={pressed} />
              <TrainerAvatar name={trainer.name} photoUrl={trainer.photoUrl} size={40} />
              <View style={styles.flex}>
                <ThemedText type="titleSmall" emphasized>
                  {trainer.name}
                </ThemedText>
                <ThemedText type="bodySmall" themeColor="onSurfaceVariant">
                  {trainer.specialty}
                </ThemedText>
              </View>
            </>
          )}
        </Pressable>

        <View style={styles.intro}>
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {LEVEL_LABELS[pkg.level]} · {pkg.weeks} semanas · {pkg.workouts.length}{' '}
            {pkg.workouts.length === 1 ? 'treino' : 'treinos'}
          </ThemedText>
          <ThemedText>{pkg.description}</ThemedText>
        </View>

        <View style={styles.group}>
          <ThemedText type="titleSmall" themeColor="onSurfaceVariant" accessibilityRole="header">
            Treinos e exercícios
          </ThemedText>
          {pkg.workouts.map((workout, index) => (
            <WorkoutPreview key={workout.name} workout={workout} packageId={pkg.id} index={index} />
          ))}
        </View>

        <View style={styles.group}>
          <View style={styles.commentsHeader}>
            <ThemedText
              type="titleSmall"
              themeColor="onSurfaceVariant"
              accessibilityRole="header"
              style={styles.flex}>
              Comentários ({pkg.comments.length})
            </ThemedText>
            {average !== undefined && (
              <View
                style={styles.rating}
                accessible
                accessibilityLabel={`Média ${formatRating(average)} de 5`}>
                <Star color={colors.tertiary} fill={colors.tertiary} size={16} aria-hidden />
                <ThemedText type="labelLarge" themeColor="onSurfaceVariant">
                  {formatRating(average)}
                </ThemedText>
              </View>
            )}
          </View>
          {pkg.comments.length === 0 ? (
            <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
              Ainda não há comentários sobre este pacote.
            </ThemedText>
          ) : (
            pkg.comments.map((comment) => <Comment key={comment.id} comment={comment} />)
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surfaceContainer,
            paddingBottom: insets.bottom + Spacing.three,
          },
        ]}>
        <View style={styles.footerInner}>
          {joined ? (
            <View style={styles.footerActions}>
              <Button
                label="Sair do pacote"
                variant="outlined"
                tone="error"
                icon={LogOut}
                onPress={leavePackage}
                style={styles.flex}
              />
              <Button
                label="Ver planejamento"
                variant="tonal"
                icon={ClipboardList}
                onPress={() => router.push('/workouts')}
                style={styles.flex}
              />
            </View>
          ) : (
            <Button
              label="Aderir ao treino"
              icon={UserPlus}
              fullWidth
              onPress={join}
              accessibilityHint="Adiciona os treinos deste pacote ao seu planejamento e os distribui pela semana"
            />
          )}
        </View>
      </View>

      <Dialog
        visible={confirmReplace && !!current}
        title="Substituir planejamento?"
        onDismiss={() => setConfirmReplace(false)}
        actions={
          <>
            <Button label="Cancelar" variant="text" onPress={() => setConfirmReplace(false)} />
            <Button
              label="Substituir"
              variant="text"
              onPress={() => {
                setConfirmReplace(false);
                confirmJoin();
              }}
            />
          </>
        }>
        {current && (
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            Você só pode seguir um pacote de treinos por vez e já segue “{current.pkg.name}”, de{' '}
            {current.trainer.name}. Ao aderir a “{pkg.name}”
            {current.trainer.id === trainer.id ? '' : `, de ${trainer.name}`}, os treinos e os dias
            da semana do planejamento de {current.trainer.name} serão substituídos.
          </ThemedText>
        )}
      </Dialog>
    </>
  );
}

function WorkoutPreview({
  workout,
  packageId,
  index,
}: {
  workout: PackageWorkout;
  packageId: string;
  index: number;
}) {
  const { colors } = useAppTheme();
  const count =
    workout.exercises.length === 1 ? '1 exercício' : `${workout.exercises.length} exercícios`;

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/trainer/workout', params: { packageId, index: String(index) } })
      }
      accessibilityRole="button"
      accessibilityLabel={`${workout.name}, ${count}. ${workout.summary}`}
      style={[styles.workout, { backgroundColor: colors.surfaceContainer }]}>
      {({ pressed }) => (
        <>
          <StateLayer color={colors.onSurface} pressed={pressed} />
          <View style={styles.flex}>
            <ThemedText type="titleMedium" emphasized>
              {workout.name}
            </ThemedText>
            <ThemedText type="bodyMedium">{workout.summary}</ThemedText>
            <ThemedText type="bodySmall" themeColor="onSurfaceVariant" style={styles.count}>
              {count}
            </ThemedText>
          </View>
          <ChevronRight color={colors.onSurfaceVariant} size={24} aria-hidden />
        </>
      )}
    </Pressable>
  );
}

function Comment({ comment }: { comment: PackageComment }) {
  const { colors } = useAppTheme();

  return (
    <Surface style={styles.comment}>
      <View style={styles.commentHeader}>
        <ThemedText type="titleSmall" emphasized style={styles.flex}>
          {comment.author}
        </ThemedText>
        <ThemedText type="bodySmall" themeColor="onSurfaceVariant">
          {commentDate.format(fromDateKey(comment.date))}
        </ThemedText>
      </View>
      <View style={styles.stars} accessible accessibilityLabel={`${comment.rating} de 5 estrelas`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            color={star <= comment.rating ? colors.tertiary : colors.outlineVariant}
            fill={star <= comment.rating ? colors.tertiary : 'transparent'}
            aria-hidden
          />
        ))}
      </View>
      <ThemedText type="bodyMedium">{comment.text}</ThemedText>
    </Surface>
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
  flex: {
    flex: 1,
  },
  trainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 56,
    marginHorizontal: -Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: ComponentShape.card,
    overflow: 'hidden',
  },
  intro: {
    gap: Spacing.two,
  },
  group: {
    gap: Spacing.three,
  },
  workout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: ComponentShape.card,
    overflow: 'hidden',
  },
  count: {
    marginTop: Spacing.one,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  comment: {
    gap: Spacing.one,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  footer: {
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  footerInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  footerActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
