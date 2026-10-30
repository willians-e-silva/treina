import { View, type ViewProps } from 'react-native';

import { useAppTheme, type ColorRole } from '@/theme';

export type ThemedViewProps = ViewProps & {
  /** M3 color role of the background. */
  type?: ColorRole;
};

export function ThemedView({ style, type = 'surface', ...otherProps }: ThemedViewProps) {
  const { colors } = useAppTheme();

  return <View style={[{ backgroundColor: colors[type] }, style]} {...otherProps} />;
}
