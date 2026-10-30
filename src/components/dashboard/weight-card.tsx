import Scale from 'lucide-react-native/icons/scale';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { formatDecimal } from './format';

import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DashboardData } from '@/lib/dashboard-data';

const CHART_HEIGHT = 72;
const PADDING = 6;

type WeightCardProps = {
  weight: DashboardData['weight'];
};

/** Latest weigh-in, change since the first one, and a trend line. */
export function WeightCard({ weight }: WeightCardProps) {
  const theme = useTheme();
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
    y: PADDING + ((max - kg) / range) * (CHART_HEIGHT - PADDING * 2),
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const last = points[points.length - 1];

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <View style={styles.title}>
          <Scale color={theme.textSecondary} size={20} aria-hidden />
          <ThemedText type="titleSmall">Peso</ThemedText>
        </View>
        <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
          Últimos 90 dias
        </ThemedText>
      </View>

      <View style={styles.summary}>
        <ThemedText style={styles.value}>
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
        style={styles.chart}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessible
        accessibilityLabel={`Tendência de peso: de ${formatDecimal(first)} para ${formatDecimal(latest)} quilos`}>
        {width > 0 && (
          <Svg width={width} height={CHART_HEIGHT}>
            <Path
              d={path}
              stroke={theme.text}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx={last.x} cy={last.y} r={4} fill={theme.text} />
          </Svg>
        )}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  value: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 700,
  },
  chart: {
    height: CHART_HEIGHT,
  },
});
