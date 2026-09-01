
// ─────────────────────────────────────────────────
// responsive.js
// Screen size utilities for responsive layouts.
// Import and use these instead of hardcoded
// pixel values anywhere in the app.
// ─────────────────────────────────────────────────
import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Device Classification ─────────────────────────
export const isSmallPhone  = SCREEN_HEIGHT < 668;   // iPhone SE, small Androids
export const isMediumPhone = SCREEN_HEIGHT >= 668 && SCREEN_HEIGHT < 812;
export const isLargePhone  = SCREEN_HEIGHT >= 812 && SCREEN_HEIGHT < 926;
export const isXLargePhone = SCREEN_HEIGHT >= 926;  // Plus/Max/Ultra models
export const isTablet      = SCREEN_WIDTH >= 768;

// ── Screen Dimensions ─────────────────────────────
export const screenWidth  = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// ── Responsive Width ──────────────────────────────
// wp(50) = 50% of screen width
export const wp = (percentage) =>
  Math.round((SCREEN_WIDTH * percentage) / 100);

// ── Responsive Height ─────────────────────────────
// hp(20) = 20% of screen height
export const hp = (percentage) =>
  Math.round((SCREEN_HEIGHT * percentage) / 100);

// ── Responsive Font Size ──────────────────────────
// Scales font size based on screen width
// Base reference: iPhone 14 (390px wide)
const BASE_WIDTH = 390;
export const rf = (size) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// ── Responsive Spacing ─────────────────────────────
// Returns different values per device size
export const rs = (small, medium, large, xlarge) => {
  if (isSmallPhone)  return small;
  if (isMediumPhone) return medium;
  if (isLargePhone)  return large;
  return xlarge ?? large;
};

// ── Hero Height ───────────────────────────────────
// Safe hero section heights per device
export const heroHeight = rs(
  SCREEN_HEIGHT * 0.38,   // small phones  — 38%
  SCREEN_HEIGHT * 0.44,   // medium phones — 44%
  SCREEN_HEIGHT * 0.48,   // large phones  — 48%
  SCREEN_HEIGHT * 0.50,   // XL phones     — 50%
);

// ── Bottom Sheet Heights ──────────────────────────
export const sheetHeight = {
  sm:  rs(260, 300, 340, 360),
  md:  rs(320, 360, 400, 440),
  lg:  rs(380, 420, 480, 520),
  xl:  rs(440, 500, 560, 600),
};

// ── Card Widths ───────────────────────────────────
// For grid layouts — adapts to tablet vs phone
export const cardWidth = {
  half:    isTablet ? wp(30) : wp(46),
  third:   isTablet ? wp(20) : wp(30),
  quarter: isTablet ? wp(15) : wp(22),
  full:    wp(100) - 40,
};

// ── Safe padding for notched devices ─────────────
export const safeBottom = Platform.OS === 'ios'
  ? rs(16, 20, 34, 34)
  : rs(12, 16, 20, 20);

export const safeTop = Platform.OS === 'ios'
  ? rs(44, 44, 47, 47)
  : rs(24, 24, 28, 28);

// ── Typography Scale ──────────────────────────────
// Responsive font sizes that scale per screen
export const rt = {
  xs:    rf(10),
  sm:    rf(12),
  base:  rf(14),
  md:    rf(15),
  lg:    rf(17),
  xl:    rf(20),
  xxl:   rf(24),
  xxxl:  rf(28),
  huge:  rf(32),
  giant: rf(38),  // capped from 40 to avoid overflow
};