import { DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { setupPlayerOnce } from '@/services/player';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/services/notifications';

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

  useEffect(() => {
    setupPlayerOnce().catch((error) => {
      console.warn('No se pudo inicializar el reproductor:', error);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      registerForPushNotificationsAsync().then(async (token: string | null) => {
        if (token) {
          try {
            await fetch('https://n8n-master-n8n.jszr3h.easypanel.host/webhook/radio-lnj/register-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            });
          } catch (e) {
            console.warn('No se pudo registrar el token push:', e);
          }
        }
      });
    }
  }, [loaded]);

  if (!loaded) {
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