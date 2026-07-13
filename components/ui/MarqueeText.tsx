import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, TextStyle, View, StyleSheet } from 'react-native';

export type MarqueeTextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  /** Velocidad de desplazamiento en px por segundo. */
  speed?: number;
  /** Espacio entre el final del texto y su repetición. */
  gap?: number;
  /** Pausa antes de empezar a deslizarse (ms). */
  delay?: number;
};

/**
 * Texto de una línea que, si no entra en el ancho disponible,
 * se desliza en loop continuo (estilo cartel LED).
 */
export function MarqueeText({ text, style, speed = 40, gap = 48, delay = 1500 }: MarqueeTextProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const shouldScroll = containerWidth > 0 && textWidth > containerWidth;

  useEffect(() => {
    translateX.setValue(0);
    if (!shouldScroll) return;

    const distance = textWidth + gap;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateX, {
          toValue: -distance,
          duration: (distance / speed) * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [shouldScroll, textWidth, gap, speed, delay, text, translateX]);

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.row, { transform: [{ translateX }] }]}>
        <Animated.Text
          key={text}
          style={[style, shouldScroll && { marginRight: gap }]}
          numberOfLines={1}
          onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
        >
          {text}
        </Animated.Text>
        {shouldScroll && (
          <Animated.Text style={style} numberOfLines={1}>
            {text}
          </Animated.Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
});
