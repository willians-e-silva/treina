import type { LucideIcon } from 'lucide-react-native';
import Cake from 'lucide-react-native/icons/cake';
import Plus from 'lucide-react-native/icons/plus';
import Ruler from 'lucide-react-native/icons/ruler';
import Scale from 'lucide-react-native/icons/scale';
import Target from 'lucide-react-native/icons/target';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CardTitle } from '@/components/dashboard/card-title';
import { formatDecimal, formatInt } from '@/components/dashboard/format';
import { TabScreen } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import {
  describeGoalProgress,
  WeightDialog,
  type WeightDialogMode,
} from '@/components/weight/weight-dialog';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/context/session';
import { useWeightLog } from '@/context/weight-log';
import { formatHeight, getInitials, MOCK_PROFILE, SEX_LABELS } from '@/lib/profile';
import { Shape, useAppTheme } from '@/theme';

export default function ProfileScreen() {
  const { colors, custom } = useAppTheme();
  const { profile: signedInProfile, signOut } = useSession();
  // The tabs only mount with a session, which always comes with a profile.
  const profile = signedInProfile ?? { ...MOCK_PROFILE, email: '' };
  const { goalKg } = useWeightLog();
  const [weightDialog, setWeightDialog] = useState<WeightDialogMode | null>(null);

  return (
    <TabScreen>
      <Surface style={styles.card}>
        <View
          style={[styles.avatar, { backgroundColor: colors.tertiaryContainer }]}
          aria-hidden>
          <ThemedText type="headlineLarge" emphasized themeColor="onTertiaryContainer">
            {getInitials(profile.name)}
          </ThemedText>
        </View>
        <ThemedText type="headlineSmall" emphasized style={styles.name} accessibilityRole="header">
          {profile.name}
        </ThemedText>
        {!!profile.email && (
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {profile.email}
          </ThemedText>
        )}
        {profile.sex !== 'unspecified' && (
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {SEX_LABELS[profile.sex]}
          </ThemedText>
        )}
      </Surface>

      <View style={styles.stats}>
        <Stat icon={Cake} color={custom.fat.color} label="Idade" value={`${formatInt(profile.age)} anos`} />
        <Stat
          icon={Scale}
          color={custom.carbs.color}
          label="Peso"
          value={`${formatDecimal(profile.weightKg)} kg`}
        />
        <Stat
          icon={Ruler}
          color={custom.steps.color}
          label="Altura"
          value={formatHeight(profile.heightCm)}
        />
      </View>

      <Surface style={styles.weight}>
        <CardTitle icon={Target} color={custom.diet.color}>
          Meta de peso
        </CardTitle>
        <View style={styles.weightValues}>
          <WeightValue label="Peso atual" kg={profile.weightKg} />
          <WeightValue label="Meta" kg={goalKg} />
        </View>
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          {goalKg === undefined
            ? 'Defina o peso que você quer alcançar para acompanhar o progresso.'
            : describeGoalProgress(profile.weightKg, goalKg)}
        </ThemedText>
        <View style={styles.weightActions}>
          <Button
            label="Registrar peso"
            variant="tonal"
            icon={Plus}
            onPress={() => setWeightDialog('current')}
            style={styles.flex}
          />
          <Button
            label={goalKg === undefined ? 'Definir meta' : 'Alterar meta'}
            variant="outlined"
            icon={Target}
            onPress={() => setWeightDialog('goal')}
            style={styles.flex}
          />
        </View>
      </Surface>

      {/* Uses the existing session sign-out; the root guard then shows the login. */}
      <Button
        label="Sair"
        variant="outlined"
        tone="error"
        size="medium"
        fullWidth
        onPress={signOut}
      />

      {weightDialog && <WeightDialog mode={weightDialog} onDismiss={() => setWeightDialog(null)} />}
    </TabScreen>
  );
}

function WeightValue({ label, kg }: { label: string; kg: number | undefined }) {
  const value = kg === undefined ? 'Não definida' : `${formatDecimal(kg)} kg`;
  return (
    <View style={styles.flex} accessible accessibilityLabel={`${label}: ${value}`}>
      <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
        {label}
      </ThemedText>
      <ThemedText
        type={kg === undefined ? 'titleMedium' : 'headlineSmall'}
        emphasized={kg !== undefined}
        themeColor={kg === undefined ? 'onSurfaceVariant' : 'onSurface'}>
        {value}
      </ThemedText>
    </View>
  );
}

type StatProps = {
  icon: LucideIcon;
  color: string;
  label: string;
  value: string;
};

function Stat({ icon: Icon, color, label, value }: StatProps) {
  return (
    <Surface style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon color={color} size={20} aria-hidden />
      <ThemedText type="titleLarge" emphasized numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </ThemedText>
      <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
        {label}
      </ThemedText>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: Shape.full,
    marginBottom: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
  },
  weight: {
    gap: Spacing.three,
  },
  weightValues: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  weightActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  stat: {
    flex: 1,
    alignSelf: 'auto',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.four,
  },
});
