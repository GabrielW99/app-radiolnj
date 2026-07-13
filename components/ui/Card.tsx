import { View, type ViewProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Radii, Shadows, Spacing } from '@/constants/Theme';

export type CardProps = ViewProps & {
  padding?: number;
};

export function Card({ style, padding = Spacing.xl, ...rest }: CardProps) {
  const backgroundColor = useThemeColor({}, 'surface');

  return (
    <View
      style={[styles.card, { backgroundColor, padding }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    ...Shadows.card,
  },
});
