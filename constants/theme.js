// Design System - Colors, Typography, Spacing
// Following PRD specifications for minimalistic, elegant design

export const COLORS = {
  // Purple brand scale (primary palette)
  purple50: '#F5F3FF',
  purple100: '#EDE9FE',
  purple200: '#DDD6FE',
  purple300: '#C4B5FD',
  purple400: '#A78BFA',
  purple500: '#8B5CF6',    // Main brand color
  purple600: '#7C3AED',
  purple700: '#6D28D9',
  
  // Gradient presets
  gradients: {
    background: ['#F6F0FF', '#FEF7F4'],
    hero: ['#8B5CF6', '#7C3AED'],        // Purple gradient for hero
    heroAlt: ['#7C3AED', '#6D28D9'],     // Darker variant
    ring: ['#F5F3FF', '#DDD6FE'],        // Light purple for rings
    card: ['#EDE9FE', '#DDD6FE'],        // Card backgrounds
    fab: ['#8B5CF6', '#7C3AED'],         // FAB gradient
  },
  
  // Semantic colors
  primary: '#8B5CF6',      // Purple - Brand
  success: '#10B981',      // Green - Optimal (updated)
  warning: '#F59E0B',      // Orange - Caution
  error: '#EF4444',        // Red - Alert
  info: '#3B82F6',         // Blue - Info
  
  // Neutrals
  background: '#F5F5F5',   // Light gray background
  white: '#FFFFFF',
  black: '#000000',
  
  // Text (updated for better contrast)
  textPrimary: '#1F2937',  // Darker for better contrast
  textSecondary: '#6B7280',// Medium gray
  textTertiary: '#9CA3AF', // Light gray
  
  // Interactive states
  disabled: 'rgba(0, 0, 0, 0.38)',
  focus: '#8B5CF6',
  active: '#7C3AED',
  
  // Borders & overlays (updated)
  border: '#D1D5DB',       // Darker for visibility
  borderLight: '#E5E7EB',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Shadows
  shadow: '#000000',
};

export const TYPOGRAPHY = {
  // Font sizes (mobile-first, WCAG AAA compliant)
  xxxl: 36,    // Hero headlines
  xxl: 32,     // Section headers  
  xl: 28,      // Card titles
  lg: 22,      // Subheadings
  base: 16,    // Body text
  sm: 14,      // Secondary text
  xs: 13,      // Captions (increased from 12 for accessibility)
  
  // Font weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

