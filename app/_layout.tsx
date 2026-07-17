import { DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { setupPlayerOnce } from '@/services/player';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { Api } from '@/constants/Api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    PlusJakartaSans: require('@/assets/fonts/PlusJakartaSans.ttf'),
  });

  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => { if (!cancelled) setPlayerReady(true); }, 8000);
    setupPlayerOnce()
      .catch((error) => console.warn('No se pudo inicializar el reproductor:', error))
      .finally(() => {
        if (!cancelled) { clearTimeout(timeout); setPlayerReady(true); }
      });
    return () => { cancelled = true; clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    if (loaded && playerReady) {
      SplashScreen.hideAsync();
      registerForPushNotificationsAsync().then(async (token: string | null) => {
        if (token) {
          try {
            await fetch(Api.registerPushToken, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            });
          } catch (e) {
            console.warn('No se pudo registrar el token push:', e);
          }
        }
      }).catch((e) => console.warn('Error al obtener token push:', e));
    }
  }, [loaded, playerReady]);

  if (!loaded || !playerReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}