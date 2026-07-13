import React, { useEffect, useRef } from 'react';
import { Animated, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Bloque gris con pulso de opacidad para estados de carga. */
export function Skeleton({ width = '100%', height = 14, borderRadius = 7, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  const backgroundColor = useThemeColor({}, 'surfaceMuted');

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor, opacity }, style]}
    />
  );
}
