import { Platform } from 'react-native';

/**
 * Design tokens de Radio LNJ.
 * Paleta light/dark, espaciados, radios, sombras y tipografía.
 */

export const Colors = {
  light: {
    text: '#1A1A1A',
    textSecondary: '#757575',
    textTertiary: '#888888',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceMuted: '#F5F2F8',
    primary: '#6B3AA0',
    accent: '#C9962E',
    live: '#FF3B30',
    badgeBg: '#F1E7FA',
    badgeText: '#8B4FC7',
    iconCircle: '#EDE7F6',
    border: '#F0EBF5',
    // Keys del template de Expo (usadas por useThemeColor y la tab bar)
    tint: '#6B3AA0',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#6B3AA0',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textTertiary: '#7C838A',
    background: '#171122',
    surface: '#221A31',
    surfaceMuted: '#2C2340',
    primary: '#B78CE0',
    accent: '#E0B95A',
    live: '#FF453A',
    badgeBg: '#3A2554',
    badgeText: '#CBA9EF',
    iconCircle: '#3A2554',
    border: '#332845',
    tint: '#B78CE0',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#B78CE0',
  },
};

/**
 * Degradado de marca para el fondo del player.
 * Light: se aclara hacia abajo y funde en blanco.
 * Dark: se apaga hacia abajo y funde en el fondo oscuro.
 */
export const BrandGradients = {
  light: ['#5B2A86', '#8B4FC7', '#A56FD9'],
  dark: ['#6B3AA0', '#472068', '#241536'],
} as const;

/** Opacidad de las ondas decorativas según el modo. */
export const WaveOpacities = {
  light: [0.2, 0.35],
  dark: [0.06, 0.12],
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 100,
} as const;

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  button: Platform.select({
    ios: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
} as const;

export const Fonts = {
  regular: 'PlusJakartaSans',
} as const;

export const Typography = {
  display: {
    fontFamily: Fonts.regular,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  title: {
    fontFamily: Fonts.regular,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  section: {
    fontFamily: Fonts.regular,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
} as const;
