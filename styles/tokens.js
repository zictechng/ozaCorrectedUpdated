
// ─────────────────────────────────────────────────
// tokens.js
// Design tokens: spacing, radius, typography,
// shadows. These do NOT change between themes.
// Extracted from styles.js for reuse.
// ─────────────────────────────────────────────────
import { StyleSheet, Platform } from 'react-native';

// ── Spacing Scale ─────────────────────────────────
export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
};

// ── Border Radius Scale ───────────────────────────
export const radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  xxl:  28,
  full: 999,
};

// ── Typography Scale ──────────────────────────────
export const typography = {
  xs:    10,
  sm:    12,
  base:  14,
  md:    15,
  lg:    17,
  xl:    20,
  xxl:   24,
  xxxl:  28,
  huge:  32,
  giant: 40,
};

// ── Shadow Presets ────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4C5FD5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};

// ── Global Styles (theme-independent) ────────────
// These use hardcoded values that don't change
// between light/dark mode.
// Theme-dependent styles use useTheme() instead.
export const gs = StyleSheet.create({
  // Navigation
  homeHeaderRow: {
    backgroundColor: 'transparent',
    marginTop: Platform.OS === 'ios' ? 10 : 40,
    marginHorizontal: 10,
  },
  homeSideMenu: {
    borderRadius: radius.full,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Utility
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
  },
});