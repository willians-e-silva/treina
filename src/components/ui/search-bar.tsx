import Search from 'lucide-react-native/icons/search';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Shape, Space, useAppTheme } from '@/theme';

/** M3 search bar: a 56dp pill in `surfaceContainerHigh` with a leading search icon. */
export function SearchBar({ style, ...props }: TextInputProps) {
  const { colors, typography } = useAppTheme();

  return (
    <View style={[styles.bar, { backgroundColor: colors.surfaceContainerHigh }, style]}>
      <Search color={colors.onSurfaceVariant} size={24} aria-hidden />
      <TextInput
        placeholderTextColor={colors.onSurfaceVariant}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        returnKeyType="search"
        style={[styles.input, typography.bodyLarge, { color: colors.onSurface }]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.lg,
    height: 56,
    borderRadius: Shape.full,
    paddingHorizontal: Space.lg,
  },
  input: {
    flex: 1,
    height: '100%',
  },
});
