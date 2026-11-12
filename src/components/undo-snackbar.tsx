import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { ComponentElevation, MinTouchTarget, Shape, shadowFor, useAppTheme } from '@/theme';

/** How long the snackbar stays up, in ms (M3: 4–10 s when it has an action). */
const DURATION_MS = 6000;
/** Above the bottom tab bar. */
const BOTTOM_OFFSET = 88;

type Pending = { key: number; message: string; undo: () => void };

type UndoContextValue = {
  /** Shows `message` with a "Desfazer" button that runs `undo`. Replaces the one on screen. */
  showUndo: (message: string, undo: () => void) => void;
};

const UndoContext = createContext<UndoContextValue | null>(null);

export function useUndo() {
  const value = use(UndoContext);
  if (!value) {
    throw new Error('useUndo must be wrapped in an <UndoProvider />');
  }
  return value;
}

/** M3 snackbar with "Desfazer", shown after a removal done with one tap. */
export function UndoProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [pending, setPending] = useState<Pending | null>(null);
  const nextKey = useRef(0);

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(null), DURATION_MS);
    return () => clearTimeout(timer);
  }, [pending]);

  function showUndo(message: string, undo: () => void) {
    nextKey.current += 1;
    setPending({ key: nextKey.current, message, undo });
  }

  return (
    <UndoContext value={{ showUndo }}>
      {children}
      {pending && (
        <View
          key={pending.key}
          pointerEvents="box-none"
          style={[styles.wrapper, { bottom: insets.bottom + BOTTOM_OFFSET }]}>
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[
              styles.snackbar,
              {
                backgroundColor: colors.inverseSurface,
                boxShadow: shadowFor(ComponentElevation.dialog, colors),
              },
            ]}>
            <ThemedText type="bodyMedium" style={[styles.text, { color: colors.inverseOnSurface }]}>
              {pending.message}
            </ThemedText>
            {/* Inverse colors: a regular text button would not show on the inverse surface. */}
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                pending.undo();
                setPending(null);
              }}
              style={styles.action}>
              <ThemedText type="labelLarge" style={{ color: colors.inversePrimary }}>
                Desfazer
              </ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </UndoContext>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    alignItems: 'center',
    zIndex: 900,
  },
  snackbar: {
    width: '100%',
    maxWidth: 560,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.one,
    borderRadius: Shape.extraSmall,
  },
  action: {
    minHeight: MinTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  text: {
    flex: 1,
    paddingVertical: Spacing.two,
  },
});
