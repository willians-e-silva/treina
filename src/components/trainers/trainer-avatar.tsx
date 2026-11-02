import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { initials } from '@/lib/trainers';
import { Shape, useAppTheme } from '@/theme';

type TrainerAvatarProps = {
  name: string;
  photoUrl: string;
  size: number;
};

/** Round photo of a trainer over their initials, which show while it loads or if it fails. */
export function TrainerAvatar({ name, photoUrl, size }: TrainerAvatarProps) {
  const { colors } = useAppTheme();

  return (
    <View
      aria-hidden
      style={[
        styles.avatar,
        { width: size, height: size, backgroundColor: colors.tertiaryContainer },
      ]}>
      <ThemedText
        type={size >= 80 ? 'headlineMedium' : 'titleMedium'}
        style={{ color: colors.onTertiaryContainer }}>
        {initials(name)}
      </ThemedText>
      <Image source={photoUrl} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: Shape.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
