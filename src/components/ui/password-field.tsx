import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import { useState } from 'react';

import { FormField, type FormFieldProps } from './form-field';
import { IconButton } from './icon-button';

type PasswordFieldProps = Omit<FormFieldProps, 'secureTextEntry' | 'trailing' | 'unit'>;

/** Form field for a password, with a button to show or hide what was typed. */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      trailing={
        <IconButton
          icon={visible ? EyeOff : Eye}
          onPress={() => setVisible((value) => !value)}
          accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
        />
      }
      {...props}
    />
  );
}
