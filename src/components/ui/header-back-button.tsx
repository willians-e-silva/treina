import { router } from 'expo-router';
import ArrowLeft from 'lucide-react-native/icons/arrow-left';

import { IconButton } from './icon-button';

import { useAppTheme } from '@/theme';

/** Navigation icon of the M3 top app bar: goes back to the previous screen. */
export function HeaderBackButton() {
  const { colors } = useAppTheme();

  return (
    <IconButton
      icon={ArrowLeft}
      color={colors.onSurface}
      onPress={() => router.back()}
      accessibilityLabel="Voltar"
    />
  );
}
