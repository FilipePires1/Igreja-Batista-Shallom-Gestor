import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const Colors = {
  primary: '#4F46E5',
  primaryHover: '#4338CA',
  primaryActive: '#3730A3',
  primaryLight: '#EEF2FF',
  onPrimary: '#FFFFFF',
  primaryContainer: '#4F46E5',
  onPrimaryContainer: '#DAD7FF',

  secondary: '#7C3AED',
  secondaryHover: '#6D28D9',
  secondaryLight: '#EDE9FE',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#8A4CFC',
  onSecondaryContainer: '#FFFBFF',

  tertiary: '#434853',
  tertiaryLight: '#F1F3FF',

  success: '#059669',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  dangerContainer: '#FFDAD6',
  onDangerContainer: '#93000A',

  background: '#F9FAFB',
  surface: '#F9FAFB',
  surfaceDim: '#D3DAEF',
  surfaceBright: '#F9FAFB',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F1F3FF',
  surfaceContainer: '#E9EDFF',
  surfaceContainerHigh: '#E1E8FD',
  surfaceContainerHighest: '#DCE2F7',

  onSurface: '#141B2B',
  onSurfaceVariant: '#464555',
  inverseSurface: '#293040',
  inverseOnSurface: '#EDF0FF',

  outline: '#777587',
  outlineVariant: '#C7C4D8',

  white: '#FFFFFF',
  neutral50: '#F9FAFB',
  neutral100: '#F3F4F6',
  neutral200: '#E5E7EB',
  neutral400: '#9CA3AF',
  neutral600: '#4B5563',
  neutral900: '#111827',
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  gutter: isWeb ? 24 : 16,
  margin: isWeb ? 32 : 16,
};

export const FontSize = {
  xxs: 9,
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  hero: 34,
  display: isWeb ? 48 : 34,
  headlineXl: isWeb ? 36 : 28,
  headlineLg: isWeb ? 24 : 20,
  headlineSm: isWeb ? 20 : 18,
  titleMd: 18,
  bodyLg: 18,
  bodyMd: 15,
  bodySm: 13,
  labelMd: 14,
  labelSm: 12,
  labelXs: 10,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
};

export const Shadows = Platform.select({
  web: {
    xs: { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } as any,
    sm: { boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' } as any,
    md: { boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)' } as any,
    lg: { boxShadow: '0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)' } as any,
    xl: { boxShadow: '0 20px 25px rgba(0,0,0,0.08), 0 10px 10px rgba(0,0,0,0.04)' } as any,
  },
  ios: {
    xs: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2 },
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 15 },
    xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.08, shadowRadius: 25 },
  },
  default: {
    xs: { elevation: 1 },
    sm: { elevation: 2 },
    md: { elevation: 4 },
    lg: { elevation: 6 },
    xl: { elevation: 10 },
  },
});
