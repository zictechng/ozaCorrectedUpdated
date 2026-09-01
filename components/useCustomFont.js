// useCustomFonts.js
import { useState, useEffect } from 'react';
import * as Font from 'expo-font';

export function useCustomFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'regular': require('./assets/fonts/Manrope-Regular.ttf'),
        'semiBold': require('./assets/fonts/Manrope-SemiBold.ttf'),
        'bold': require('./assets/fonts/Manrope-Bold.ttf'),
        'medium': require('./assets/fonts/Manrope-Medium.ttf'),
        'light': require('./assets/fonts/Manrope-Light.ttf'),
      });

      setFontsLoaded(true);
    }

    loadFonts();
  }, []);

  return {fontsLoaded};
}
