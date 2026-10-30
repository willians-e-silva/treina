import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/theme';

type TabScreenProps = PropsWithChildren<{
  /** Rendered above the content, e.g. the logo or a screen title. */
  header?: ReactNode;
  /** Floating action button, pinned to the bottom-right corner. */
  fab?: ReactNode;
}>;

/** Room kept under the content so the FAB never covers the last item. */
const FAB_CLEARANCE = 56 + Spacing.three * 2;

/**
 * Scrollable container shared by the main tab screens. The tab bar lays the
 * screen out above itself (and handles the bottom inset), so this only keeps
 * the content clear of the status bar, notches and side insets.
 */
export function TabScreen({ header, fab, children }: TabScreenProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: fab ? FAB_CLEARANCE : Spacing.four,
          },
        ]}>
        <View style={styles.container}>
          {header && <View style={styles.header}>{header}</View>}
          <View style={styles.body}>{children}</View>
        </View>
      </ScrollView>
      {fab && <View style={[styles.fab, { right: insets.right + Spacing.three }]}>{fab}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
  header: {
    paddingTop: Spacing.three,
  },
  body: {
    flexGrow: 1,
    gap: Spacing.three,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.three,
  },
});
