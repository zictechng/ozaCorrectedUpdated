import { useState, useEffect } from 'react';
import * as Font from 'expo-font';

export function useCustomFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          '_regular': require('./assets/fonts/Manrope-Regular.ttf'),
          '_semiBold': require('./assets/fonts/Manrope-SemiBold.ttf'),
          '_bold': require('./assets/fonts/Manrope-Bold.ttf'),
          '_medium': require('./assets/fonts/Manrope-Medium.ttf'),
          '_light': require('./assets/fonts/Manrope-Light.ttf'),
        });
        setFontsLoaded(true); // only mark loaded after fonts finish
      } catch (err) {
        console.error('Error loading fonts:', err);
      }
    }

    loadFonts();
  }, []);

  return { fontsLoaded };
}
