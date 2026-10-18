import { StyleSheet, View } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ActivityCards } from "@/components/dashboard/activity-cards";
import { CaloriesCard } from "@/components/dashboard/calories-card";
import { MacrosCard } from "@/components/dashboard/macros-card";
import { WeightCard } from "@/components/dashboard/weight-card";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useSession } from "@/context/session";
import { MOCK_DASHBOARD } from "@/lib/dashboard-data";

export default function HomeScreen() {
  const { session } = useSession();
  // TODO: load from the real diary / activity source.
  const data = MOCK_DASHBOARD;

  return (
    <TabScreen header={<AppLogo />}>
      <View style={styles.welcome}>
        <ThemedText type="subtitle" accessibilityRole="header">
          Hoje
        </ThemedText>
        {session && (
          <ThemedText themeColor="textSecondary" numberOfLines={1}>
            {session}
          </ThemedText>
        )}
      </View>

      <CaloriesCard calories={data.calories} />
      <MacrosCard macros={data.macros} />
      <ActivityCards steps={data.steps} exercise={data.exercise} />
      <WeightCard weight={data.weight} />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  welcome: {
    gap: Spacing.one,
  },
});
