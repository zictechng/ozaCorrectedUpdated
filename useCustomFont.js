// useCustomFonts.js
import { useState, useEffect } from 'react';
import * as Font from 'expo-font';

export function useCustomFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(true);

  useEffect(() => {
    async function loadFonts() {
      try {
        setFontsLoaded(true);
        await Font.loadAsync({
          '_regular': require('./assets/fonts/Manrope-Regular.ttf'),
          '_semiBold': require('./assets/fonts/Manrope-SemiBold.ttf'),
          '_bold': require('./assets/fonts/Manrope-Bold.ttf'),
          '_medium': require('./assets/fonts/Manrope-Medium.ttf'),
          '_light': require('./assets/fonts/Manrope-Light.ttf'),
        });
      } catch (err) {

      } finally {
        setFontsLoaded(false);
      }

    }

    loadFonts();
  }, []);

  return { fontsLoaded };
}
