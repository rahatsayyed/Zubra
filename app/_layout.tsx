// @@iconify-code-gen
import '@/global.css';

import { LoadingScreen } from '@/components/loading-screen';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import {
  AndadaPro_400Regular,
  AndadaPro_500Medium,
  AndadaPro_600SemiBold,
  AndadaPro_700Bold,
} from '@expo-google-fonts/andada-pro';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { initDatabase } from '@/lib/data/database';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [isDbReady, setIsDbReady] = useState(false);
  const [fontsLoaded] = useFonts({
    AndadaPro_400Regular,
    AndadaPro_500Medium,
    AndadaPro_600SemiBold,
    AndadaPro_700Bold,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
    Amiri_400Regular,
    Amiri_700Bold,
  });

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        console.log("Database setup complete");
        setIsDbReady(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };
    setupDatabase();
  }, []);

  if (!isDbReady || !fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack />
      <PortalHost />
    </ThemeProvider>
  );
}
