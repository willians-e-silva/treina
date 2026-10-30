import type { NavigationHelpers, ParamListBase } from 'expo-router/react-navigation';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SlidingTab, SlidingTabsEventMap } from './types';

import { ThemedText } from '@/components/themed-text';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabBarProps = {
  tabs: SlidingTab[];
  /** Focused tab. */
  index: number;
  navigation: NavigationHelpers<ParamListBase, SlidingTabsEventMap>;
  position: SharedValue<number>;
  onPressIndex: (index: number) => void;
};

export function TabBar({ tabs, index: focusedIndex, navigation, position, onPressIndex }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.backgroundSelected,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}>
      <View style={styles.items}>
        {tabs.map((tab, index) => {
          const focused = index === focusedIndex;

          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: tab.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              onPressIndex(index);
            }
          }

          return (
            <TabBarButton
              key={tab.name}
              index={index}
              position={position}
              focused={focused}
              label={tab.options.title ?? tab.name}
              icon={tab.options.tabBarIcon}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: tab.key })}
            />
          );
        })}
      </View>
    </View>
  );
}

type TabBarButtonProps = {
  index: number;
  position: SharedValue<number>;
  focused: boolean;
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  onLongPress: () => void;
};

/**
 * The selected look (brand-colored icon and label) is drawn on a layer clipped by a one-tab-wide "window"
 * that sits at `position` along the footer. As the position moves right, the
 * window leaves the old button (emptying it left to right) and enters the next
 * one (filling it left to right), crossing every button in between. The
 * layer's content is counter-translated so only the clip moves, not the icon.
 */
function TabBarButton({
  index,
  position,
  focused,
  label,
  icon,
  onPress,
  onLongPress,
}: TabBarButtonProps) {
  const theme = useTheme();
  const width = useSharedValue(0);

  const windowStyle = useAnimatedStyle(() => {
    const offset = Math.min(Math.max(position.get() - index, -1), 1);
    const w = width.get();
    if (w === 0) {
      // Not measured yet: show only the current tab as selected.
      return { opacity: Math.abs(offset) < 0.5 ? 1 : 0, transform: [{ translateX: 0 }] };
    }
    return { opacity: 1, transform: [{ translateX: offset * w }] };
  });

  const contentStyle = useAnimatedStyle(() => {
    const offset = Math.min(Math.max(position.get() - index, -1), 1);
    return { transform: [{ translateX: -offset * width.get() }] };
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onLayout={(e) => width.set(e.nativeEvent.layout.width)}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      style={styles.button}>
      <TabBarItemContent icon={icon} label={label} color={theme.textSecondary} />

      <Animated.View aria-hidden style={[styles.layer, styles.clip, windowStyle]}>
        <Animated.View style={[styles.layer, contentStyle]}>
          <TabBarItemContent icon={icon} label={label} color={Brand.primary} selected />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

type TabBarItemContentProps = {
  icon?: LucideIcon;
  label: string;
  color: string;
  selected?: boolean;
};

function TabBarItemContent({ icon: Icon, label, color, selected }: TabBarItemContentProps) {
  return (
    <View style={[styles.layer, styles.content]}>
      {Icon && <Icon color={color} size={24} strokeWidth={selected ? 2.5 : 2} />}
      <ThemedText style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );
}

const BUTTON_HEIGHT = 60;

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  items: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  button: {
    flex: 1,
    height: BUTTON_HEIGHT,
    // Clips the moving window to this button.
    overflow: 'hidden',
  },
  layer: {
    ...StyleSheet.absoluteFill,
  },
  clip: {
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 600,
  },
});
