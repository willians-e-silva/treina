import type { LucideIcon } from 'lucide-react-native';
import Cake from 'lucide-react-native/icons/cake';
import Ruler from 'lucide-react-native/icons/ruler';
import Scale from 'lucide-react-native/icons/scale';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatDecimal, formatInt } from '@/components/dashboard/format';
import { ScreenTitle } from '@/components/screen-title';
import { TabScreen } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { getMainTab } from '@/constants/tabs';
import { Brand, Nutrition, Spacing } from '@/constants/theme';
import { useSession } from '@/context/session';
import { useTheme } from '@/hooks/use-theme';
import { formatHeight, getAge, getInitials, MOCK_PROFILE } from '@/lib/profile';

const tab = getMainTab('profile');

export default function ProfileScreen() {
  const theme = useTheme();
  const { session, signOut } = useSession();
  const profile = MOCK_PROFILE;
  const age = getAge(profile.birthDate);

  return (
    <TabScreen header={<ScreenTitle>{tab.label}</ScreenTitle>}>
      <Surface style={styles.card}>
        <View style={styles.avatar} aria-hidden>
          <ThemedText style={styles.initials}>{getInitials(profile.name)}</ThemedText>
        </View>
        <ThemedText style={styles.name} accessibilityRole="header">
          {profile.name}
        </ThemedText>
        {session && (
          <ThemedText type="small" themeColor="textSecondary">
            {session}
          </ThemedText>
        )}
      </Surface>

      <View style={styles.stats}>
        <Stat icon={Cake} color={Nutrition.fat} label="Idade" value={`${formatInt(age)} anos`} />
        <Stat
          icon={Scale}
          color={Nutrition.carbs}
          label="Peso"
          value={`${formatDecimal(profile.weightKg)} kg`}
        />
        <Stat
          icon={Ruler}
          color={Nutrition.steps}
          label="Altura"
          value={formatHeight(profile.heightCm)}
        />
      </View>

      {/* Uses the existing session sign-out; the root guard then shows the login. */}
      <Pressable
        onPress={signOut}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.signOut,
          { borderColor: theme.backgroundSelected },
          pressed && styles.pressed,
        ]}>
        <ThemedText style={styles.signOutText}>Sair</ThemedText>
      </Pressable>
    </TabScreen>
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
      <ThemedText style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
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
    borderRadius: 44,
    marginBottom: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.primary,
  },
  initials: {
    color: Brand.onPrimary,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 700,
  },
  name: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 700,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  stat: {
    flex: 1,
    alignSelf: 'auto',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.four,
  },
  statValue: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 700,
  },
  signOut: {
    height: 52,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: Brand.danger,
    fontWeight: 600,
  },
  pressed: {
    opacity: 0.7,
  },
});
