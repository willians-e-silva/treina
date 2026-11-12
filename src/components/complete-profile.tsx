import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BodyDataStep, type BodyDataValues } from '@/components/signup/body-data-step';
import { Button } from '@/components/ui/button';
import { useSession } from '@/context/session';
import { useWeightLog } from '@/context/weight-log';
import { saveBodyData } from '@/data/profile';
import { toDateKey } from '@/lib/exercises';
import type { Profile } from '@/lib/profile';
import { useAppTheme } from '@/theme';

/**
 * Asks for the body data a profile lacks (accounts created with Google start
 * with only the name), so the estimates use the user's own data. Shown by the
 * tabs layout in place of the tabs until the profile is complete.
 */
export function CompleteProfile({ profile }: { profile: Profile }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, setProfile, signOut } = useSession();
  const { logWeight } = useWeightLog();

  async function submit({ weightKg, ...body }: BodyDataValues) {
    if (!user) return;
    await saveBodyData(user, body);
    // The weigh-in goes through the weight log, which retries if it fails.
    if (weightKg !== profile.weightKg) logWeight(weightKg, toDateKey(new Date()));
    setProfile((current) => current && { ...current, ...body, weightKg });
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.surface }}>
      <BodyDataStep
        step={1}
        steps={1}
        title="Complete seu perfil"
        description="Usamos esses dados para estimar suas calorias e acompanhar seu progresso."
        submitLabel="Continuar"
        initial={{
          birthDate: profile.birthDate ?? undefined,
          sex: profile.sex ?? undefined,
          heightCm: profile.heightCm ?? undefined,
          weightKg: profile.weightKg ?? undefined,
        }}
        onSubmit={submit}
        toMessage={() => 'Não foi possível salvar seus dados. Verifique sua conexão e tente novamente.'}
        footer={<Button label="Sair" variant="text" onPress={signOut} />}
      />
    </View>
  );
}
