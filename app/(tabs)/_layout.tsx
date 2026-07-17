import { Tabs, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedTabIcon } from '@/components/navigation/AnimatedTabIcon';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors, Fonts } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Geometría de la tab bar flotante (debe coincidir con tabBarStyle)
const BAR_MARGIN = 16;
const BAR_HEIGHT = 66;
const INDICATOR_WIDTH = 18;
// Distancia del subrayado al borde inferior de la barra
const INDICATOR_BOTTOM = 5;

const TAB_COUNT = 4;

const TAB_INDEX: Record<string, number> = {
  '/': 0,
  '/predicas': 1,
  '/dailyVerse': 2,
  '/media': 3,
};

/** Subrayado que se desliza hasta el tab activo. */
function SlidingIndicator({ color, barBottom }: { color: string; barBottom: number }) {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const index = TAB_INDEX[pathname] ?? 0;

  const segment = (width - BAR_MARGIN * 2) / TAB_COUNT;
  const targetX = index * segment + segment / 2 - INDICATOR_WIDTH / 2;
  const translateX = useRef(new Animated.Value(targetX)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: targetX,
      friction: 7,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [targetX, translateX]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: BAR_MARGIN,
        bottom: barBottom + INDICATOR_BOTTOM,
        width: INDICATOR_WIDTH,
        height: 3,
        borderRadius: 2,
        backgroundColor: color,
        transform: [{ translateX }],
      }}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const barBottom = Math.max(insets.bottom, 12);

  // Ícono con bounce al activarse (el subrayado lo maneja SlidingIndicator)
  const withIndicator = (focused: boolean, icon: React.ReactNode) => (
    <AnimatedTabIcon focused={focused}>{icon}</AnimatedTabIcon>
  );

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: 'absolute',
          left: BAR_MARGIN,
          right: BAR_MARGIN,
          bottom: barBottom,
          height: BAR_HEIGHT,
          borderRadius: 33,
          backgroundColor: theme.surface,
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: 10,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 20,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.regular,
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) =>
            withIndicator(
              focused,
              <TabBarIcon name={focused ? 'radio' : 'radio-outline'} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="predicas"
        options={{
          title: 'Prédicas',
          tabBarIcon: ({ color, focused }) =>
            withIndicator(
              focused,
              <MaterialCommunityIcons name="podcast" size={26} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="dailyVerse"
        options={{
          title: 'Verso Diario',
          tabBarIcon: ({ color, focused }) =>
            withIndicator(focused, <FontAwesome5 name="bible" size={24} color={color} />),
        }}
      />
      <Tabs.Screen
        name="media"
        options={{
          title: 'Redes',
          tabBarIcon: ({ color, focused }) =>
            withIndicator(
              focused,
              <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
            ),
        }}
      />
    </Tabs>
    <SlidingIndicator color={theme.primary} barBottom={barBottom} />
    </View>
  );
}
