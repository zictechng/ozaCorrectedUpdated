
// ─────────────────────────────────────────────────
// themeContext.js
// Theme context definition.
// ─────────────────────────────────────────────────
import { createContext } from 'react';
import { lightColors } from '../styles/lightTheme';

export const ThemeContext = createContext({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});