import ChartPie from "lucide-react-native/icons/chart-pie";
import { StyleSheet, View } from "react-native";

import { CardTitle } from "./card-title";
import { formatInt } from "./format";
import { ProgressBar } from "./progress-bar";
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
  /** Half-width version: one bar per macronutrient instead of rings. */
  compact?: boolean;
};

/** One ring per macronutrient with grams consumed against the goal. */
export function MacrosCard({ macros, compact }: MacrosCardProps) {
  const { colors, custom } = useAppTheme();

  if (compact) {
    return (
      <Surface style={[styles.container, styles.compact]}>
        <CardTitle icon={ChartPie} color={colors.onSurfaceVariant}>
          Macronutrientes
        </CardTitle>
        {MACROS.map(({ key, label }) => {
          const { consumed, goal } = macros[key];
          const { color } = custom[key];
          return (
            <View
              key={key}
              style={styles.bar}
              accessible
              accessibilityLabel={`${label}: ${consumed} de ${goal} gramas`}
            >
              <View style={styles.barLabel}>
                <ThemedText type="labelMedium" style={{ color }} numberOfLines={1}>
                  {label}
                </ThemedText>
                <ThemedText type="labelMedium" themeColor="onSurfaceVariant">
                  {formatInt(consumed)}/{formatInt(goal)}g
                </ThemedText>
              </View>
              <ProgressBar progress={consumed / goal} color={color} />
            </View>
          );
        })}
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <CardTitle icon={ChartPie} color={colors.onSurfaceVariant}>
        Macronutrientes
      </CardTitle>
      <View style={styles.row}>
        {MACROS.map(({ key, label }) => {
          const { consumed, goal } = macros[key];
          const { color } = custom[key];
          return (
            <View
              key={key}
              style={styles.macro}
              accessible
              accessibilityLabel={`${label}: ${consumed} de ${goal} gramas`}
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
            </View>
          );
        })}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    // Fills its row when it sits next to a taller card.
    flexGrow: 1,
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  compact: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  bar: {
    gap: Spacing.one,
  },
  barLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.one,
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
