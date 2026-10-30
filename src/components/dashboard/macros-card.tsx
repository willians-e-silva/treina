import { StyleSheet, View } from "react-native";

import { formatInt } from "./format";
import { ProgressRing } from "./progress-ring";

import { ThemedText } from "@/components/themed-text";
import { Surface } from "@/components/ui/surface";
import { Spacing } from "@/constants/theme";
import type { DashboardData, MacroKey } from "@/lib/dashboard-data";
import { useAppTheme } from "@/theme";

/** Macro → its custom color in the theme (same key). */
const MACROS: { key: MacroKey; label: string }[] = [
  { key: "carbs", label: "Carboidratos" },
  { key: "protein", label: "Proteínas" },
  { key: "fat", label: "Gorduras" },
];

type MacrosCardProps = {
  macros: DashboardData["macros"];
};

/** One ring per macronutrient with grams consumed against the goal. */
export function MacrosCard({ macros }: MacrosCardProps) {
  const { custom } = useAppTheme();

  return (
    <Surface style={styles.container}>
      <ThemedText type="titleSmall">Macronutrientes</ThemedText>
      <View style={styles.row}>
        {MACROS.map(({ key, label }) => {
          const { consumed, goal } = macros[key];
          const { color } = custom[key];
          const left = Math.max(goal - consumed, 0);
          return (
            <View
              key={key}
              style={styles.macro}
              accessible
              accessibilityLabel={`${label}: ${consumed} de ${goal} gramas, faltam ${left}`}
            >
              <ProgressRing
                progress={consumed / goal}
                color={color}
                size={76}
                strokeWidth={8}
              >
                <ThemedText type="titleSmall">{formatInt(consumed)}</ThemedText>
                <ThemedText type="labelSmall" themeColor="onSurfaceVariant">
                  /{formatInt(goal)}g
                </ThemedText>
              </ProgressRing>
              <ThemedText type="labelLarge" style={{ color }}>
                {label}
              </ThemedText>
              <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
                {formatInt(left)}g restantes
              </ThemedText>
            </View>
          );
        })}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  macro: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.one,
  },
});
