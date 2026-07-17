import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import TrackPlayer, {
  State,
  useActiveTrack,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';

import { RADIO_TRACK_ID } from '@/services/player';
import { savePosition } from '@/services/predicas';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Fonts, Radii, Shadows, Spacing } from '@/constants/Theme';

const RATES = [1, 1.25, 1.5] as const;
const SAVE_EVERY_SECONDS = 5;

const formatTime = (totalSeconds: number) => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

/**
 * Controles de la prédica en curso, fijos sobre la tab bar.
 * Solo se muestra si el track activo es una prédica (no la radio).
 */
export function PredicaMiniPlayer() {
  const insets = useSafeAreaInsets();
  const track = useActiveTrack();
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress(1000);

  const [rateIndex, setRateIndex] = useState(0);
  const [seekingValue, setSeekingValue] = useState<number | null>(null);
  const lastSavedRef = useRef(0);

  const surface = useThemeColor({}, 'surface');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');

  const isPredica = !!track && track.id !== RADIO_TRACK_ID;
  const trackId = isPredica ? (track.id as string) : null;
  const isPlaying = playbackState.state === State.Playing;

  // Al cambiar de prédica, la velocidad vuelve a 1x (playPredica hace setRate(1))
  useEffect(() => {
    setRateIndex(0);
    lastSavedRef.current = 0;
  }, [trackId]);

  // Guarda la posición cada ~5s mientras suena, para retomar después
  useEffect(() => {
    if (!trackId || !isPlaying) return;
    if (Math.abs(position - lastSavedRef.current) >= SAVE_EVERY_SECONDS) {
      lastSavedRef.current = position;
      savePosition(trackId, position);
    }
  }, [position, isPlaying, trackId]);

  if (!isPredica) return null;

  const totalDuration = duration || track?.duration || 0;
  const sliderValue = seekingValue ?? position;

  const togglePlayPause = async () => {
    if (isPlaying) {
      savePosition(trackId!, position);
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const jump = async (deltaSeconds: number) => {
    const target = Math.min(Math.max(0, position + deltaSeconds), totalDuration || Infinity);
    await TrackPlayer.seekTo(target);
  };

  const cycleRate = async () => {
    const next = (rateIndex + 1) % RATES.length;
    setRateIndex(next);
    await TrackPlayer.setRate(RATES[next]);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: surface, bottom: Math.max(insets.bottom, 12) + 66 + Spacing.sm },
      ]}
    >
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="podcast" size={16} color={primary} />
        <Text style={[styles.title, { color: text }]} numberOfLines={1}>
          {track.title}
          <Text style={{ color: textSecondary }}> · {track.artist}</Text>
        </Text>
        <TouchableOpacity
          style={[styles.rateButton, { backgroundColor: surfaceMuted }]}
          onPress={cycleRate}
          accessibilityRole="button"
          accessibilityLabel={`Velocidad ${RATES[rateIndex]}x`}
        >
          <Text style={[styles.rateText, { color: primary }]}>{RATES[rateIndex]}x</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressRow}>
        <Text style={[styles.time, { color: textSecondary }]}>{formatTime(sliderValue)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={totalDuration > 0 ? totalDuration : 1}
          value={Math.min(sliderValue, totalDuration || 1)}
          onValueChange={setSeekingValue}
          onSlidingComplete={async (value) => {
            await TrackPlayer.seekTo(value);
            savePosition(trackId!, value);
            setSeekingValue(null);
          }}
          minimumTrackTintColor={primary}
          maximumTrackTintColor={surfaceMuted}
          thumbTintColor={primary}
          accessibilityLabel="Posición de la prédica"
        />
        <Text style={[styles.time, { color: textSecondary }]}>{formatTime(totalDuration)}</Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={() => jump(-15)}
          accessibilityRole="button"
          accessibilityLabel="Retroceder 15 segundos"
        >
          <MaterialCommunityIcons name="rewind-15" size={30} color={text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayPause}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pausar prédica' : 'Reproducir prédica'}
        >
          <MaterialCommunityIcons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={52}
            color={primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => jump(15)}
          accessibilityRole="button"
          accessibilityLabel="Adelantar 15 segundos"
        >
          <MaterialCommunityIcons name="fast-forward-15" size={30} color={text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    ...Shadows.card,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    fontWeight: '700',
  },
  rateButton: {
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  rateText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  slider: {
    flex: 1,
    height: 32,
  },
  time: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    fontWeight: '600',
    minWidth: 38,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxl,
  },
});
