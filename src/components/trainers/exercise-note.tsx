import MessageSquareText from 'lucide-react-native/icons/message-square-text';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/theme';

/** The trainer's note on an exercise, under its name. */
export function ExerciseNote({ note }: { note: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.note} accessible accessibilityLabel={`Observação do treinador: ${note}`}>
      <MessageSquareText color={colors.tertiary} size={16} style={styles.icon} aria-hidden />
      <ThemedText type="bodySmall" themeColor="onSurfaceVariant" style={styles.text}>
        {note}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  icon: {
    // Lines up with the first line of text.
    marginTop: 1,
  },
  text: {
    flex: 1,
  },
});
