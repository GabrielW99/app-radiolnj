import { View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useThemeColor } from '@/hooks/useThemeColor';

export type IconCircleProps = {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  size?: number;
};

/** Ícono púrpura dentro de un círculo lila claro. */
export function IconCircle({ name, size = 44 }: IconCircleProps) {
  const backgroundColor = useThemeColor({}, 'iconCircle');
  const primary = useThemeColor({}, 'primary');

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <MaterialCommunityIcons name={name} size={size / 2} color={primary} />
    </View>
  );
}
