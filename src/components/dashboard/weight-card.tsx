import Plus from 'lucide-react-native/icons/plus';
import Scale from 'lucide-react-native/icons/scale';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { CardTitle } from './card-title';
import { formatDecimal } from './format';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { Surface } from '@/components/ui/surface';
import {
  describeGoalProgress,
  WeightDialog,
  type WeightDialogMode,
} from '@/components/weight/weight-dialog';
import { Spacing } from '@/constants/theme';
import { useWeightLog } from '@/context/weight-log';
import { useAppTheme } from '@/theme';

const CHART_HEIGHT = 72;
const COMPACT_CHART_HEIGHT = 44;
const PADDING = 6;

type WeightCardProps = {
  /** Half-width version: shorter chart, without the period label. */
  compact?: boolean;
};

/**
 * Latest weigh-in, change since the first one, a trend line with the goal
 * (dashed) and buttons to log the weight or set the goal.
 */
export function WeightCard({ compact }: WeightCardProps) {
  const chartHeight = compact ? COMPACT_CHART_HEIGHT : CHART_HEIGHT;
  const { colors } = useAppTheme();
  const { entries: weight, goalKg } = useWeightLog();
  const [width, setWidth] = useState(0);
  const [dialog, setDialog] = useState<WeightDialogMode | null>(null);

  const header = (
    <View style={styles.header}>
      <CardTitle icon={Scale} color={colors.onSurfaceVariant}>
        Peso
      </CardTitle>
      <IconButton
        icon={Plus}
        onPress={() => setDialog('current')}
        accessibilityLabel="Registrar peso"
      />
    </View>
  );
  const dialogs = dialog && <WeightDialog mode={dialog} onDismiss={() => setDialog(null)} />;

  if (weight.length === 0) {
    return (
      <Surface style={[styles.container, compact && styles.compact]}>
        {header}
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          Registre seu peso para acompanhar a evolução.
        </ThemedText>
        {dialogs}
      </Surface>
    );
  }

  const first = weight[0].kg;
  const latest = weight[weight.length - 1].kg;
  const change = latest - first;
  const sign = change > 0 ? '+' : change < 0 ? '−' : '';

  const values = weight.map((w) => w.kg);
  // The goal is part of the range, so its line is always on the chart.
  const min = Math.min(...values, goalKg ?? Infinity);
  const max = Math.max(...values, goalKg ?? -Infinity);
  const range = max - min || 1;
  const toY = (kg: number) => PADDING + ((max - kg) / range) * (chartHeight - PADDING * 2);
  const points = values.map((kg, i) => ({
    x: PADDING + (i / Math.max(values.length - 1, 1)) * (width - PADDING * 2),
    y: toY(kg),
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const last = points[points.length - 1];

  return (
    <Surface style={[styles.container, compact && styles.compact]}>
      {header}

      <View style={styles.summary}>
        <ThemedText type="headlineSmall" emphasized>
          {formatDecimal(latest)}
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {' '}
            kg
          </ThemedText>
        </ThemedText>
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          {sign}
          {formatDecimal(Math.abs(change))} kg no período
        </ThemedText>
      </View>

      <View
        style={{ height: chartHeight }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessible
        accessibilityLabel={`Tendência de peso: de ${formatDecimal(first)} para ${formatDecimal(latest)} quilos${goalKg === undefined ? '' : `, meta de ${formatDecimal(goalKg)} quilos`}`}>
        {width > 0 && (
          <Svg width={width} height={chartHeight}>
            {goalKg !== undefined && (
              <Line
                x1={PADDING}
                x2={width - PADDING}
                y1={toY(goalKg)}
                y2={toY(goalKg)}
                stroke={colors.outline}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            )}
            <Path
              d={path}
              stroke={colors.tertiary}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx={last.x} cy={last.y} r={4} fill={colors.tertiary} />
          </Svg>
        )}
      </View>

      <View style={styles.goal}>
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" style={styles.flex}>
          {goalKg === undefined
            ? 'Sem meta definida'
            : compact
              ? `Meta ${formatDecimal(goalKg)} kg`
              : `Meta ${formatDecimal(goalKg)} kg · ${describeGoalProgress(latest, goalKg)}`}
        </ThemedText>
        {!compact && (
          <ThemedText
            type="labelLarge"
            themeColor="secondary"
            onPress={() => setDialog('goal')}
            accessibilityRole="button"
            suppressHighlighting
            style={styles.goalAction}>
            {goalKg === undefined ? 'Definir' : 'Alterar'}
          </ThemedText>
        )}
      </View>

      {dialogs}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    // Fills its row when it sits next to a taller card.
    flexGrow: 1,
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  compact: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // The 48dp icon button does not make the card taller.
    marginVertical: -Spacing.two,
    marginRight: -Spacing.two,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  goalAction: {
    // A comfortable touch target around the short label.
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    marginVertical: -Spacing.two,
  },
  flex: {
    flex: 1,
  },
});
