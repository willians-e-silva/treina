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
import { formatWeightRange, WeightRangeDialog } from '@/components/weight/weight-range-dialog';
import { Spacing } from '@/constants/theme';
import { useWeightLog, type WeighIn } from '@/context/weight-log';
import { toDateKey } from '@/lib/exercises';
import {
  DEFAULT_WEIGHT_RANGE,
  weighInPeriods,
  weighInsInRange,
  type WeightRange,
} from '@/lib/weight';
import { useAppTheme } from '@/theme';

const CHART_HEIGHT = 136;
const COMPACT_CHART_HEIGHT = 112;
/** Room above the line for the weight of each point. */
const TOP = 22;
/** Room under the line for the month of each period. */
const BOTTOM = 22;
/** Keeps the labels of the first and last points inside the card. */
const SIDE = 18;
/** Width of each month's column. */
const COLUMN_WIDTH = 2;
/** Width of the box each weight label is centered in. */
const LABEL_WIDTH = 44;

/** `"nos últimos 90 dias"`, `"no último ano"`. */
const RANGE_NAMES: Record<WeightRange, string> = {
  30: 'nos últimos 30 dias',
  60: 'nos últimos 60 dias',
  90: 'nos últimos 90 dias',
  180: 'nos últimos 180 dias',
  365: 'no último ano',
};

type WeightCardProps = {
  /** Half-width version: shorter chart, without the period label. */
  compact?: boolean;
};

/**
 * Latest weigh-in and, for the chosen period (90 days by default), the change
 * and a line with the weight of every weigh-in and its month, the goal
 * (dashed) and buttons to log the weight or set the goal.
 */
export function WeightCard({ compact = false }: WeightCardProps) {
  const chartHeight = compact ? COMPACT_CHART_HEIGHT : CHART_HEIGHT;
  const { colors } = useAppTheme();
  const { entries: weight, goalKg } = useWeightLog();
  const [dialog, setDialog] = useState<WeightDialogMode | null>(null);
  const [range, setRange] = useState<WeightRange>(DEFAULT_WEIGHT_RANGE);
  const [choosingRange, setChoosingRange] = useState(false);

  const header = (
    <View style={styles.header}>
      <CardTitle icon={Scale} color={colors.onSurfaceVariant}>
        Peso
      </CardTitle>
      <View style={styles.headerActions}>
        {/* Without weigh-ins there is no chart to pick a period for. */}
        {weight.length > 0 && (
          <ThemedText
            type="labelLarge"
            themeColor="secondary"
            onPress={() => setChoosingRange(true)}
            accessibilityRole="button"
            accessibilityLabel={`Período: ${formatWeightRange(range)}`}
            suppressHighlighting
            style={styles.textAction}>
            Período
          </ThemedText>
        )}
        <IconButton
          icon={Plus}
          onPress={() => setDialog('current')}
          accessibilityLabel="Registrar peso"
        />
      </View>
    </View>
  );
  const dialogs = (
    <>
      {dialog && <WeightDialog mode={dialog} onDismiss={() => setDialog(null)} />}
      {choosingRange && (
        <WeightRangeDialog
          value={range}
          onChange={setRange}
          onDismiss={() => setChoosingRange(false)}
        />
      )}
    </>
  );

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

  // The current weight is the latest weigh-in, even when it is older than the period.
  const latest = weight[weight.length - 1].kg;
  const visible = weighInsInRange(weight, range, toDateKey(new Date()));
  const change = visible.length > 0 ? latest - visible[0].kg : 0;
  const sign = change > 0 ? '+' : change < 0 ? '−' : '';

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
        {visible.length > 0 && (
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            {sign}
            {formatDecimal(Math.abs(change))} kg {RANGE_NAMES[range]}
          </ThemedText>
        )}
      </View>

      {visible.length > 0 ? (
        <WeightChart entries={visible} goalKg={goalKg} height={chartHeight} />
      ) : (
        <View style={[styles.noData, { height: chartHeight }]}>
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant" style={styles.noDataText}>
            Nenhuma pesagem {RANGE_NAMES[range]}.
          </ThemedText>
        </View>
      )}

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
            style={styles.textAction}>
            {goalKg === undefined ? 'Definir' : 'Alterar'}
          </ThemedText>
        )}
      </View>

      {dialogs}
    </Surface>
  );
}

type WeightChartProps = {
  /** Oldest first; at least one. */
  entries: WeighIn[];
  goalKg: number | undefined;
  height: number;
};

/**
 * Weigh-ins evenly spaced, each with its weight above it, over a faint
 * dotted column for each month, centered over the month's name.
 */
function WeightChart({ entries, goalKg, height }: WeightChartProps) {
  const { colors } = useAppTheme();
  const [width, setWidth] = useState(0);

  const values = entries.map((entry) => entry.kg);
  // The goal is part of the range, so its line is always on the chart.
  const min = Math.min(...values, goalKg ?? Infinity);
  const max = Math.max(...values, goalKg ?? -Infinity);
  const range = max - min || 1;
  const toY = (kg: number) => TOP + ((max - kg) / range) * (height - TOP - BOTTOM);
  const points = values.map((kg, i) => ({
    // A single weigh-in sits in the middle.
    x: values.length === 1 ? width / 2 : SIDE + (i / (values.length - 1)) * (width - SIDE * 2),
    y: toY(kg),
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  // Each month spans halfway to the weigh-ins of the neighboring months; its
  // column and name sit in the middle.
  const periods = weighInPeriods(entries);
  const bands = periods.map((period, i) => ({
    key: period.month,
    label: formatMonth(period.month),
    x0: i === 0 ? 0 : (points[period.start - 1].x + points[period.start].x) / 2,
    x1: i === periods.length - 1 ? width : (points[period.end].x + points[period.end + 1].x) / 2,
  }));

  const count = `${entries.length} ${entries.length === 1 ? 'pesagem' : 'pesagens'}`;
  const goal = goalKg === undefined ? '' : `, meta de ${formatDecimal(goalKg)} quilos`;

  return (
    <View
      style={{ height }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={`Gráfico de peso: ${count}, de ${formatDecimal(values[0])} para ${formatDecimal(values[values.length - 1])} quilos${goal}`}>
      {width > 0 && (
        <>
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            {bands.map((band) => (
              <Line
                key={band.key}
                x1={(band.x0 + band.x1) / 2}
                x2={(band.x0 + band.x1) / 2}
                y1={0}
                y2={height - BOTTOM}
                stroke={colors.outlineVariant}
                strokeWidth={COLUMN_WIDTH}
                strokeDasharray="2 4"
              />
            ))}
            {goalKg !== undefined && (
              <Line
                x1={0}
                x2={width}
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
            {points.map((point, i) => (
              <Circle
                key={entries[i].date}
                cx={point.x}
                cy={point.y}
                r={i === points.length - 1 ? 4 : 3}
                fill={colors.tertiary}
              />
            ))}
          </Svg>

          {points.map((point, i) => (
            <ThemedText
              key={entries[i].date}
              type="labelSmall"
              themeColor={i === points.length - 1 ? 'onSurface' : 'onSurfaceVariant'}
              numberOfLines={1}
              style={[styles.pointLabel, { left: point.x - LABEL_WIDTH / 2, top: point.y - 20 }]}>
              {formatDecimal(values[i])}
            </ThemedText>
          ))}
          {bands.map((band) => (
            <ThemedText
              key={band.key}
              type="labelSmall"
              themeColor="onSurfaceVariant"
              numberOfLines={1}
              style={[styles.bandLabel, { left: band.x0, width: band.x1 - band.x0 }]}>
              {band.label}
            </ThemedText>
          ))}
        </>
      )}
    </View>
  );
}

const monthNames = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

/** `"2026-10"` → `"out"`: the month's name only, without the year. */
function formatMonth(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  return monthNames.format(new Date(year, monthNumber - 1, 1)).replace('.', '');
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  noData: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    textAlign: 'center',
  },
  pointLabel: {
    position: 'absolute',
    width: LABEL_WIDTH,
    textAlign: 'center',
  },
  bandLabel: {
    position: 'absolute',
    bottom: 2,
    textAlign: 'center',
  },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  textAction: {
    // A comfortable touch target around the short label.
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    marginVertical: -Spacing.two,
  },
  flex: {
    flex: 1,
  },
});
