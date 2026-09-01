
// ─────────────────────────────────────────────────
// useTheme.js
// Custom hook to access theme anywhere in the app.
//
// Usage in any screen or component:
//   const { colors, isDark, toggleTheme } = useTheme();
//
// Then use colors.bgColor, colors.textBlack etc.
// They automatically switch between light/dark.
// ─────────────────────────────────────────────────
import { useContext } from 'react';
import { ThemeContext } from '../contextAPI/themeContext';

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
};

export default useTheme;