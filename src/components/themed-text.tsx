import { Text, type TextProps } from 'react-native';

import { useAppTheme, type ColorRole, type TypographyToken } from '@/theme';

export type ThemedTextProps = TextProps & {
  /** M3 type scale token. */
  type?: TypographyToken;
  /** M3 color role of the text. */
  themeColor?: ColorRole;
  /**
   * Bold version of the style (M3 Expressive "emphasized" type), for numbers
   * and headings that need more weight than the base scale.
   */
  emphasized?: boolean;
};

export function ThemedText({
  style,
  type = 'bodyLarge',
  themeColor = 'onSurface',
  emphasized,
  ...rest
}: ThemedTextProps) {
  const { colors, typography } = useAppTheme();

  return (
    <Text
      style={[
        typography[type],
        { color: colors[themeColor] },
        emphasized && { fontWeight: '700' },
        style,
      ]}
      {...rest}
    />
  );
}
