import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

type Props = {
  focused: boolean;
  children: React.ReactNode;
};

/**
 * Envuelve el ícono del tab con un leve bounce al activarse.
 * El subrayado indicador se dibuja aparte (SlidingIndicator en el layout
 * de tabs), que se desliza hasta el tab activo; acá solo queda un
 * espaciador para reservar su lugar.
 */
export function AnimatedTabIcon({ focused, children }: Props) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  }, [focused, progress]);

  const iconScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ scale: iconScale }] }}>{children}</Animated.View>
      <View style={{ height: 3, marginTop: 3 }} />
    </View>
  );
}
