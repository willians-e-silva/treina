import Scale from 'lucide-react-native/icons/scale';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { CardTitle } from './card-title';
import { formatDecimal } from './format';

import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/theme';
import type { DashboardData } from '@/lib/dashboard-data';

const CHART_HEIGHT = 72;
const COMPACT_CHART_HEIGHT = 44;
const PADDING = 6;

type WeightCardProps = {
  weight: DashboardData['weight'];
  /** Half-width version: shorter chart, without the period label. */
  compact?: boolean;
};

/** Latest weigh-in, change since the first one, and a trend line. */
export function WeightCard({ weight, compact }: WeightCardProps) {
  const chartHeight = compact ? COMPACT_CHART_HEIGHT : CHART_HEIGHT;
  const { colors } = useAppTheme();
  const [width, setWidth] = useState(0);

  if (weight.length === 0) {
    return null;
  }

  const first = weight[0].kg;
  const latest = weight[weight.length - 1].kg;
  const change = latest - first;
  const sign = change > 0 ? '+' : change < 0 ? '−' : '';

  const values = weight.map((w) => w.kg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((kg, i) => ({
    x: PADDING + (i / Math.max(values.length - 1, 1)) * (width - PADDING * 2),
    y: PADDING + ((max - kg) / range) * (chartHeight - PADDING * 2),
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const last = points[points.length - 1];

  return (
    <Surface style={[styles.container, compact && styles.compact]}>
      <View style={styles.header}>
        <CardTitle icon={Scale} color={colors.onSurfaceVariant}>
          Peso
        </CardTitle>
        {!compact && (
          <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
            Últimos 90 dias
          </ThemedText>
        )}
      </View>

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
        accessibilityLabel={`Tendência de peso: de ${formatDecimal(first)} para ${formatDecimal(latest)} quilos`}>
        {width > 0 && (
          <Svg width={width} height={chartHeight}>
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
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
