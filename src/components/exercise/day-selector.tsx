import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
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
  return (
    <Surface style={styles.container}>
      <IconButton
        icon={ChevronLeft}
        onPress={() => onChange(addDays(date, -1))}
        accessibilityLabel="Dia anterior"
      />
      <ThemedText type="titleMedium" accessibilityLiveRegion="polite">
        {formatDay(date)}
      </ThemedText>
      <IconButton
        icon={ChevronRight}
        onPress={() => onChange(addDays(date, 1))}
        accessibilityLabel="Próximo dia"
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.one,
  },
});
