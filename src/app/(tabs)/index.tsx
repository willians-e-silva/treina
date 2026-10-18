import { StyleSheet, View } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ComingSoon } from "@/components/coming-soon";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { getMainTab } from "@/constants/tabs";
import { Spacing } from "@/constants/theme";
import { useSession } from "@/context/session";

const tab = getMainTab("index");

export default function HomeScreen() {
  const { session } = useSession();

  return (
    <TabScreen header={<AppLogo />}>
      <View style={styles.welcome}>
        <ThemedText type="subtitle" accessibilityRole="header">
          Bem-vindo
        </ThemedText>
        {session && (
          <ThemedText themeColor="textSecondary" numberOfLines={1}>
            {session}
          </ThemedText>
        )}
      </View>

      {/* Add home sections below, each as its own component. */}
      <ComingSoon
        icon={tab.icon}
        message="O conteúdo da tela inicial aparecerá aqui em breve."
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  welcome: {
    gap: Spacing.one,
  },
});
