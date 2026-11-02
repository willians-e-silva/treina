import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type CardTitleProps = {
  icon: LucideIcon;
  /** Icon color, usually the custom color of what the card shows. */
  color: string;
  children: string;
};

/** Title shared by the dashboard cards: icon followed by bold text. */
export function CardTitle({ icon: Icon, color, children }: CardTitleProps) {
  return (
    <View style={styles.title}>
      <Icon color={color} size={20} aria-hidden />
      <ThemedText type="titleSmall" emphasized accessibilityRole="header">
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
