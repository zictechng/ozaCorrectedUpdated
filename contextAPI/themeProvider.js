
// ─────────────────────────────────────────────────
// themeProvider.js
// Wraps the app with theme context.
// Persists theme preference to AsyncStorage.
// Toggle anywhere in the app via useTheme().
// ─────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from './themeContext';
import { lightColors } from '../styles/lightTheme';
import { darkColors } from '../styles/darkTheme';

const THEME_KEY = 'app_theme_mode';

const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Load saved theme on launch ────────────────
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved !== null) {
          setIsDark(saved === 'dark');
        } else {
          // Default to system preference if no saved preference
          setIsDark(systemScheme === 'dark');
        }
      } catch (error) {
        console.log('Theme load error:', error.message);
        setIsDark(false);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // ── Toggle theme ──────────────────────────────
  const toggleTheme = useCallback(async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Theme save error:', error.message);
    }
  }, [isDark]);

  // ── Set theme directly ────────────────────────
  const setTheme = useCallback(async (dark) => {
    setIsDark(dark);
    try {
      await AsyncStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch (error) {
      console.log('Theme save error:', error.message);
    }
  }, []);

  const colors = isDark ? darkColors : lightColors;

  // Don't render until theme is loaded
  // Prevents flash of wrong theme on launch
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;