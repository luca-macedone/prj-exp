/**
 * Theme configuration
 * Dark theme inspired by modern fintech apps
 */

// DEPRECATED: colors export is no longer used
// All components now use Tailwind/NativeWind with ThemeContext
// export const colors = {
//   // Primary
//   primary: '#007AFF',
//   primaryDark: '#0051D5',
//   primaryLight: '#4DA3FF',
//
//   // Background - Dark theme
//   background: {
//     primary: '#0A1628',      // Navy dark blue
//     secondary: '#152039',    // Slightly lighter navy
//     card: '#1E2D47',        // Card background
//     cardGradientStart: '#1E3A5F',
//     cardGradientEnd: '#2C4A6F',
//   },
//
//   // Text
//   text: {
//     primary: '#FFFFFF',
//     secondary: '#A0AEC0',
//     tertiary: '#718096',
//     inverse: '#1A202C'
//   },
//
//   // Status colors
//   success: '#10B981',
//   successLight: '#34D399',
//   warning: '#F59E0B',
//   warningLight: '#FBBF24',
//   error: '#EF4444',
//   errorLight: '#F87171',
//   info: '#3B82F6',
//
//   // Category colors
//   categories: {
//     Food: '#FF6B6B',
//     Transport: '#4ECDC4',
//     Shopping: '#FFD93D',
//     Bills: '#6C5CE7',
//     Entertainment: '#FF8787',
//     Health: '#A8E6CF',
//     Income: '#10B981',
//     Other: '#95A5A6'
//   },
//
//   // UI Elements
//   border: '#2D3748',
//   borderLight: '#4A5568',
//   overlay: 'rgba(0, 0, 0, 0.5)',
//
//   // Shadows
//   shadow: {
//     color: '#000000',
//     sm: {
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.15,
//       shadowRadius: 4,
//       elevation: 2
//     },
//     md: {
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: 0.2,
//       shadowRadius: 8,
//       elevation: 4
//     },
//     lg: {
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 8 },
//       shadowOpacity: 0.25,
//       shadowRadius: 12,
//       elevation: 6
//     }
//   }
// };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16
  }
};
