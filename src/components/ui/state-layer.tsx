import { StyleSheet, View } from 'react-native';

import { StateLayer as StateLayerOpacity } from '@/theme';

/**
 * M3 state layer: a translucent overlay in the component's content color,
 * shown while it is pressed. Place it as the first child of a component with
 * `overflow: 'hidden'` so it follows the corner radius.
 */
export function StateLayer({ color, pressed }: { color: string; pressed: boolean }) {
  if (!pressed) return null;
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: color, opacity: StateLayerOpacity.pressed },
      ]}
    />
  );
}
