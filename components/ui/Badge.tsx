import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Fonts, Radii, Spacing } from '@/constants/Theme';

export type BadgeProps = {
  label: string;
  variant?: 'live' | 'info' | 'muted';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function Badge({ label, variant = 'info', icon }: BadgeProps) {
  const live = useThemeColor({}, 'live');
  const badgeBg = useThemeColor({}, 'badgeBg');
  const badgeText = useThemeColor({}, 'badgeText');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');
  const textTertiary = useThemeColor({}, 'textTertiary');

  const backgroundColor =
    variant === 'live' ? live : variant === 'info' ? badgeBg : surfaceMuted;
  const color =
    variant === 'live' ? '#fff' : variant === 'info' ? badgeText : textTertiary;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      {variant === 'live' && <View style={styles.liveDot} />}
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={12}
          color={color}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, variant === 'live' && styles.liveLabel, { color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: Spacing.xs + 2,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.regular,
    fontWeight: '600',
    fontSize: 12,
  },
  liveLabel: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
