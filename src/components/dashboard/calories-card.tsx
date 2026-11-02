import type { LucideIcon } from "lucide-react-native";
import Flag from "lucide-react-native/icons/flag";
import Target from "lucide-react-native/icons/target";
import Flame from "lucide-react-native/icons/flame";
import Utensils from "lucide-react-native/icons/utensils";
import { StyleSheet, View } from "react-native";

import { CardTitle } from "./card-title";
import { formatInt } from "./format";
import { ProgressRing } from "./progress-ring";

import { ThemedText } from "@/components/themed-text";
import { Surface } from "@/components/ui/surface";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/theme";
import type { DashboardData } from "@/lib/dashboard-data";

type CaloriesCardProps = {
  calories: DashboardData["calories"];
  /** Half-width version: the ring only, without the legend. */
  compact?: boolean;
};

/** Remaining calories = goal − food + exercise, shown as a ring. */
export function CaloriesCard({ calories, compact }: CaloriesCardProps) {
  const { goal, food, exercise } = calories;
  const budget = goal + exercise;
  const remaining = budget - food;
  const over = remaining < 0;
  const { colors, custom } = useAppTheme();

  return (
    <Surface style={[styles.container, compact && styles.compact]}>
      <CardTitle icon={Target} color={custom.diet.color}>
        Meta diaria
      </CardTitle>

      <View style={styles.content}>
        <ProgressRing
          progress={budget > 0 ? food / budget : 0}
          color={over ? colors.error : custom.diet.color}
          size={compact ? 104 : 136}
          strokeWidth={compact ? 10 : 12}
        >
          <ThemedText
            type={compact ? "titleLarge" : "headlineMedium"}
            emphasized
            themeColor={over ? "error" : "onSurface"}
            accessibilityLabel={`${formatInt(Math.abs(remaining))} calorias ${over ? "acima da meta" : "restantes"}`}
          >
            {formatInt(Math.abs(remaining))}
          </ThemedText>
          <ThemedText
            type={compact ? "labelMedium" : "bodyMedium"}
            themeColor="onSurfaceVariant"
          >
            {over ? "Acima" : "Restantes"}
          </ThemedText>
        </ProgressRing>

        {!compact && (
          <View style={styles.legend}>
            <LegendRow icon={Flag} label="Meta base" value={goal} />
            <LegendRow icon={Utensils} label="Alimentos" value={food} />
            <LegendRow
              icon={Flame}
              label="Exercício"
              value={exercise}
              color={custom.exercise.color}
            />
          </View>
        )}
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
  const { colors } = useAppTheme();

  return (
    <View style={styles.legendRow}>
      <Icon color={color ?? colors.onSurfaceVariant} size={20} aria-hidden />
      <View>
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          {label}
        </ThemedText>
        <ThemedText type="titleSmall">{formatInt(value)}</ThemedText>
      </View>
    </View>
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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    gap: Spacing.three,
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
