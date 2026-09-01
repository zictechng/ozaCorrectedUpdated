
// ─────────────────────────────────────────────────
// styles/index.js
// Central export for all style utilities.
// Screens import from here instead of ../styles
//
// Usage:
//   import { useThemeStyles } from '../styles';
//   const { colors, gs, shadows } = useThemeStyles();
// ─────────────────────────────────────────────────
export { lightColors } from './lightTheme';
export { darkColors } from './darkTheme';
export { spacing, radius, typography, shadows, gs } from './tokens';