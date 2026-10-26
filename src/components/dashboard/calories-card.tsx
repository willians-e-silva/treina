import type { LucideIcon } from "lucide-react-native";
import Flag from "lucide-react-native/icons/flag";
import Flame from "lucide-react-native/icons/flame";
import Utensils from "lucide-react-native/icons/utensils";
import { StyleSheet, View } from "react-native";

import { formatInt } from "./format";
import { ProgressRing } from "./progress-ring";

import { ThemedText } from "@/components/themed-text";
import { Surface } from "@/components/ui/surface";
import { Brand, Nutrition, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { DashboardData } from "@/lib/dashboard-data";

type CaloriesCardProps = {
  calories: DashboardData["calories"];
};

/** Remaining calories = goal − food + exercise, shown as a ring. */
export function CaloriesCard({ calories }: CaloriesCardProps) {
  const { goal, food, exercise } = calories;
  const budget = goal + exercise;
  const remaining = budget - food;
  const over = remaining < 0;

  return (
    <Surface style={styles.container}>
      <View>
        <ThemedText type="smallBold">Meta diaria</ThemedText>
      </View>

      <View style={styles.content}>
        <ProgressRing
          progress={budget > 0 ? food / budget : 0}
          color={over ? Brand.danger : Nutrition.calories}
          size={136}
          strokeWidth={12}
        >
          <ThemedText
            style={[styles.remaining, over && { color: Brand.danger }]}
            accessibilityLabel={`${formatInt(Math.abs(remaining))} calorias ${over ? "acima da meta" : "restantes"}`}
          >
            {formatInt(Math.abs(remaining))}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {over ? "Acima" : "Restantes"}
          </ThemedText>
        </ProgressRing>

        <View style={styles.legend}>
          <LegendRow icon={Flag} label="Meta base" value={goal} />
          <LegendRow icon={Utensils} label="Alimentos" value={food} />
          <LegendRow
            icon={Flame}
            label="Exercício"
            value={exercise}
            color={Nutrition.exercise}
          />
        </View>
      </View>
    </Surface>
  );
}

type LegendRowProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  color?: string;
};

function LegendRow({ icon: Icon, label, value, color }: LegendRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.legendRow}>
      <Icon color={color ?? theme.textSecondary} size={20} aria-hidden />
      <View>
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
        <ThemedText type="smallBold">{formatInt(value)}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    gap: Spacing.three,
  },
  remaining: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
  },
  legend: {
    gap: Spacing.three,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
});
