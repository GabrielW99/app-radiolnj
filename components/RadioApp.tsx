import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { G, Path } from "react-native-svg";
import TrackPlayer, { State, useActiveTrack, usePlaybackState } from "react-native-track-player";
import { FontAwesome } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { playRadio, setupPlayerOnce, RADIO_TRACK_ID } from "@/services/player";
import { MarqueeText } from "./ui/MarqueeText";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { BrandGradients, Fonts, Spacing, Typography, WaveOpacities } from "@/constants/Theme";

const WAVES_HEIGHT = 110;
const VOLUME_STORAGE_KEY = "@radio_volume";

// Paths con misma altura al inicio y al fin para que el tile horizontal sea continuo.
const WAVE_PATHS = [
  "M0,96 C240,160 480,32 720,64 C960,96 1200,192 1440,96 L1440,320 L0,320 Z",
  "M0,176 C280,112 560,240 840,208 C1080,180 1320,112 1440,176 L1440,320 L0,320 Z",
] as const;

const WAVE_DURATIONS = [18000, 12000] as const;

/** Capa de onda duplicada (2 tiles) que se desplaza horizontalmente. */
const WaveLayer = ({
  d,
  opacity,
  translateX,
}: {
  d: string;
  opacity: number;
  translateX: Animated.Value;
}) => (
  <Animated.View style={[styles.waveLayer, { transform: [{ translateX }] }]}>
    <Svg width="100%" height={WAVES_HEIGHT} viewBox="0 0 2880 320" preserveAspectRatio="none">
      <Path fill="#FFFFFF" fillOpacity={opacity} d={d} />
      <G transform="translate(1440, 0)">
        <Path fill="#FFFFFF" fillOpacity={opacity} d={d} />
      </G>
    </Svg>
  </Animated.View>
);

/** Ondas decorativas al pie del degradado; la última se funde con el fondo. */
const Waves = ({
  fillColor,
  opacities,
  animated,
}: {
  fillColor: string;
  opacities: readonly [number, number];
  animated: boolean;
}) => {
  const [width, setWidth] = useState(0);
  const offsets = useRef([new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    if (!animated || width === 0) {
      offsets.forEach((value) => {
        value.stopAnimation();
        value.setValue(0);
      });
      return;
    }

    const loops = offsets.map((value, i) => {
      // Capas en sentidos opuestos y a distinta velocidad para dar profundidad.
      const from = i === 0 ? 0 : -width;
      const to = i === 0 ? -width : 0;
      value.setValue(from);
      return Animated.loop(
        Animated.timing(value, {
          toValue: to,
          duration: WAVE_DURATIONS[i],
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    });
    loops.forEach((loop) => loop.start());

    return () => loops.forEach((loop) => loop.stop());
  }, [animated, width, offsets]);

  return (
    <View
      style={styles.waves}
      pointerEvents="none"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <WaveLayer d={WAVE_PATHS[0]} opacity={opacities[0]} translateX={offsets[0]} />
      <WaveLayer d={WAVE_PATHS[1]} opacity={opacities[1]} translateX={offsets[1]} />
      <Svg width="100%" height={WAVES_HEIGHT} viewBox="0 0 1440 320" preserveAspectRatio="none">
        <Path
          fill={fillColor}
          d="M0,240 C240,296 520,208 800,240 C1080,272 1280,296 1440,264 L1440,320 L0,320 Z"
        />
      </Svg>
    </View>
  );
};

const RadioApp = () => {
  const insets = useSafeAreaInsets();
  const playbackState = usePlaybackState();
  const activeTrack = useActiveTrack();
  const nowPlaying = useNowPlaying();
  const colorScheme = useColorScheme() ?? "light";
  const [volume, setVolume] = useState(1);

  // Restaura el último volumen elegido por el usuario
  useEffect(() => {
    AsyncStorage.getItem(VOLUME_STORAGE_KEY)
      .then((saved) => {
        if (saved === null) return;
        const value = Number(saved);
        if (Number.isFinite(value) && value >= 0 && value <= 1) {
          setVolume(value);
          TrackPlayer.setVolume(value).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const isRadioActive = activeTrack?.id === RADIO_TRACK_ID;

  // Refleja el tema actual en la notificación / media session (solo si la
  // fuente activa es la radio; no pisar el título de una prédica)
  useEffect(() => {
    if (!nowPlaying || !isRadioActive) return;
    setupPlayerOnce()
      .then(() =>
        TrackPlayer.updateMetadataForTrack(0, {
          title: nowPlaying,
          artist: "Radio LNJ · 100.9 FM",
        })
      )
      .catch(() => {
        // El player todavía no está listo; se reintenta en el próximo poll
      });
  }, [nowPlaying, isRadioActive]);

  const background = useThemeColor({}, "background");
  const surfaceMuted = useThemeColor({}, "surfaceMuted");
  const textSecondary = useThemeColor({}, "textSecondary");
  const primary = useThemeColor({}, "primary");
  const live = useThemeColor({}, "live");

  // El estado global del player solo aplica acá si la fuente activa es la radio
  const state = playbackState.state;
  const isPlaying = isRadioActive && state === State.Playing;
  const isBusy = isRadioActive && (state === State.Buffering || state === State.Loading);
  const hasError = isRadioActive && state === State.Error;

  const isTogglingRef = useRef(false);

  const togglePlayback = async () => {
    if (isTogglingRef.current) return;
    isTogglingRef.current = true;
    try {
      if (isPlaying || isBusy) {
        // Radio en vivo: detener en lugar de pausar para no acumular buffer.
        await TrackPlayer.stop();
      } else if (hasError) {
        try {
          await TrackPlayer.retry();
        } catch {
          await playRadio();
        }
      } else {
        // playRadio() reconecta el stream al vivo (y corta una prédica si sonaba).
        await playRadio();
      }
    } catch (error) {
      console.warn("Error al controlar la reproducción:", error);
    } finally {
      isTogglingRef.current = false;
    }
  };

  const accessibilityLabel = hasError
    ? "Reintentar conexión"
    : isPlaying || isBusy
      ? "Detener radio"
      : "Reproducir radio";

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Sección superior: degradado púrpura con identidad de la radio */}
      <LinearGradient
        colors={[...BrandGradients[colorScheme]]}
        style={[styles.gradient, { paddingTop: insets.top + Spacing.xl }]}
      >
        <View style={styles.heroContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/ministeriologo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.radioName}>Radio LNJ</Text>
          <Text style={styles.radioFrequency}>100.9 FM</Text>

          {nowPlaying && (
            <View style={styles.nowPlayingRow}>
              <FontAwesome6 name="music" size={12} color="rgba(255, 255, 255, 0.9)" />
              <MarqueeText text={nowPlaying} style={styles.nowPlayingText} />
            </View>
          )}
        </View>

        <Waves fillColor={background} opacities={WaveOpacities[colorScheme]} animated={isPlaying} />
      </LinearGradient>

      {/* Sección inferior: controles sobre fondo sólido */}
      <View style={styles.controlsSection}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={togglePlayback}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          {isBusy ? (
            <View style={styles.busyIndicator}>
              <ActivityIndicator size="large" color={primary} />
            </View>
          ) : (
            <FontAwesome6
              name={isPlaying ? "circle-stop" : "circle-play"}
              size={84}
              color={primary}
            />
          )}
        </TouchableOpacity>

        {hasError && (
          <Text style={[styles.errorText, { color: live }]}>
            No se pudo conectar a la radio. Tocá el botón para reintentar.
          </Text>
        )}

        <View style={styles.volumeContainer}>
          <FontAwesome name="volume-down" size={20} color={textSecondary} />
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={setVolume}
            onSlidingComplete={(value) => {
              TrackPlayer.setVolume(value);
              AsyncStorage.setItem(VOLUME_STORAGE_KEY, String(value)).catch(() => {});
            }}
            minimumTrackTintColor={primary}
            maximumTrackTintColor={surfaceMuted}
            thumbTintColor={primary}
            accessibilityLabel="Volumen"
          />
          <FontAwesome name="volume-up" size={20} color={textSecondary} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1.5,
    justifyContent: "center",
  },
  heroContent: {
    alignItems: "center",
    paddingBottom: WAVES_HEIGHT * 0.6,
  },
  waves: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: WAVES_HEIGHT,
    overflow: "hidden",
  },
  waveLayer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "200%",
  },
  logoContainer: {
    width: 140,
    height: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    shadowColor: "#2D1244",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  logo: {
    width: "75%",
    height: "100%",
  },
  radioName: {
    ...Typography.title,
    fontSize: 30,
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  radioFrequency: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
  },
  nowPlayingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    maxWidth: "85%",
  },
  nowPlayingText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.95)",
  },
  controlsSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: 90, // deja lugar a la tab bar flotante
  },
  controlButton: {
    padding: Spacing.md,
  },
  busyIndicator: {
    width: 84,
    height: 84,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: "500",
    marginTop: Spacing.sm,
    textAlign: "center",
    paddingHorizontal: Spacing.xxl,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  slider: {
    width: 200,
    height: 40,
  },
});

export default RadioApp;
