import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabScreenProps = PropsWithChildren<{
  /** Rendered above the content, e.g. the logo or a screen title. */
  header?: ReactNode;
}>;

/**
 * Scrollable container shared by the main tab screens. The tab bar lays the
 * screen out above itself (and handles the bottom inset), so this only keeps
 * the content clear of the status bar, notches and side insets.
 */
export function TabScreen({ header, children }: TabScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right },
      ]}>
      <View style={styles.container}>
        {header && <View style={styles.header}>{header}</View>}
        <View style={styles.body}>{children}</View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.four,
  },
  container: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    paddingTop: Spacing.three,
  },
  body: {
    flexGrow: 1,
    gap: Spacing.three,
  },
});
