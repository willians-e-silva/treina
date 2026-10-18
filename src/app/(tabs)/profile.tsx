import { Pressable, StyleSheet } from 'react-native';

import { ComingSoon } from '@/components/coming-soon';
import { ScreenTitle } from '@/components/screen-title';
import { TabScreen } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { getMainTab } from '@/constants/tabs';
import { Brand, Spacing } from '@/constants/theme';
import { useSession } from '@/context/session';
import { useTheme } from '@/hooks/use-theme';

const tab = getMainTab('profile');

export default function ProfileScreen() {
  const theme = useTheme();
  const { signOut } = useSession();

  return (
    <TabScreen header={<ScreenTitle>{tab.label}</ScreenTitle>}>
      <ComingSoon icon={tab.icon} />

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

const styles = StyleSheet.create({
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
