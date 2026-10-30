import { ThemedText } from './themed-text';

/** Title shown at the top of a tab screen. */
export function ScreenTitle({ children }: { children: string }) {
  return (
    <ThemedText type="headlineMedium" accessibilityRole="header">
      {children}
    </ThemedText>
  );
}
