import { StyleSheet, View } from "react-native";

import { formatInt } from "./format";
import { ProgressRing } from "./progress-ring";

import { ThemedText } from "@/components/themed-text";
import { Surface } from "@/components/ui/surface";
import { Nutrition, Spacing } from "@/constants/theme";
import type { DashboardData, MacroKey } from "@/lib/dashboard-data";

const MACROS: { key: MacroKey; label: string; color: string }[] = [
  { key: "carbs", label: "Carboidratos", color: Nutrition.carbs },
  { key: "protein", label: "Proteínas", color: Nutrition.protein },
  { key: "fat", label: "Gorduras", color: Nutrition.fat },
];

type MacrosCardProps = {
  macros: DashboardData["macros"];
};

/** One ring per macronutrient with grams consumed against the goal. */
export function MacrosCard({ macros }: MacrosCardProps) {
  return (
    <Surface style={styles.container}>
      <ThemedText type="smallBold">Macronutrientes</ThemedText>
      <View style={styles.row}>
        {MACROS.map(({ key, label, color }) => {
          const { consumed, goal } = macros[key];
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
                <ThemedText type="smallBold">{formatInt(consumed)}</ThemedText>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.goal}
                >
                  /{formatInt(goal)}g
                </ThemedText>
              </ProgressRing>
              <ThemedText type="small" style={{ color }}>
                {label}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
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
  goal: {
    fontSize: 11,
    lineHeight: 14,
  },
});
