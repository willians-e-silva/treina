import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addDays, fromDateKey, toDateKey } from '@/lib/exercises';

const weekday = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

function formatDay(key: string) {
  const today = toDateKey(new Date());
  if (key === today) return 'Hoje';
  if (key === addDays(today, -1)) return 'Ontem';
  if (key === addDays(today, 1)) return 'Amanhã';
  return weekday.format(fromDateKey(key));
}

type DaySelectorProps = {
  date: string;
  onChange: (date: string) => void;
};

/** Previous / next day arrows around the diary day, like the MyFitnessPal diary. */
export function DaySelector({ date, onChange }: DaySelectorProps) {
  const theme = useTheme();

  return (
    <Surface style={styles.container}>
      <Pressable
        onPress={() => onChange(addDays(date, -1))}
        accessibilityRole="button"
        accessibilityLabel="Dia anterior"
        hitSlop={Spacing.two}
        style={({ pressed }) => pressed && styles.pressed}>
        <ChevronLeft color={theme.text} size={24} />
      </Pressable>
      <ThemedText type="titleSmall" accessibilityLiveRegion="polite">
        {formatDay(date)}
      </ThemedText>
      <Pressable
        onPress={() => onChange(addDays(date, 1))}
        accessibilityRole="button"
        accessibilityLabel="Próximo dia"
        hitSlop={Spacing.two}
        style={({ pressed }) => pressed && styles.pressed}>
        <ChevronRight color={theme.text} size={24} />
      </Pressable>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
  },
  pressed: {
    opacity: 0.5,
  },
});
