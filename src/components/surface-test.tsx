import { useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { ThemedText } from './themed-text';
import { Surface } from './ui/surface';

import { Spacing } from '@/constants/theme';

/**
 * TEMPORARY: checks `Surface` sizing — width follows the screen, height
 * follows the content. Shows the panel's measured size next to the window
 * size; rotate the device or resize the browser to see the width update.
 * Remove once no longer needed.
 */
export function SurfaceTest() {
  const window = useWindowDimensions();
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <Surface
      style={styles.container}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ width: Math.round(width), height: Math.round(height) });
      }}>
      <ThemedText type="smallBold">Teste do Surface</ThemedText>
      <ThemedText type="code">
        painel: {size.width} × {size.height}
      </ThemedText>
      <ThemedText type="code" themeColor="textSecondary">
        janela: {Math.round(window.width)} × {Math.round(window.height)}
      </ThemedText>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
});
