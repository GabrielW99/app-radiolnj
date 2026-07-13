import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import TrackPlayer, { State, useActiveTrack, usePlaybackState } from 'react-native-track-player';

import { Card } from './ui/Card';
import { IconCircle } from './ui/IconCircle';
import { Skeleton } from './ui/Skeleton';
import { PredicaMiniPlayer } from './PredicaMiniPlayer';
import { usePredicas } from '@/hooks/usePredicas';
import { playPredica } from '@/services/player';
import { savePosition, type Predica } from '@/services/predicas';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Fonts, Radii, Spacing, Typography } from '@/constants/Theme';

const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
] as const;

const PLACEHOLDER = require('@/assets/images/ministeriologo.png');

// Deja lugar a la tab bar flotante + el mini-player encima
const LIST_BOTTOM_PADDING = 230;

/** "2025-06-08" → "8 jun 2025". Si el formato no matchea, devuelve el crudo. */
const formatFecha = (fecha: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!match) return fecha;
  const [, y, m, d] = match;
  const mes = MESES_CORTOS[Number(m) - 1];
  if (!mes) return fecha;
  return `${Number(d)} ${mes} ${y}`;
};

const formatDuracion = (totalSeconds: number) => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
};

const PredicaCard = ({
  predica,
  isActive,
  isPlaying,
  isBusy,
  onPress,
}: {
  predica: Predica;
  isActive: boolean;
  isPlaying: boolean;
  isBusy: boolean;
  onPress: () => void;
}) => {
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');

  const meta = [formatFecha(predica.fecha)];
  if (predica.audio_duracion) meta.push(formatDuracion(predica.audio_duracion));

  const iconName = isBusy ? 'loading' : isPlaying ? 'pause' : 'play';

  return (
    <Card padding={Spacing.lg} style={styles.card}>
      <Image
        source={predica.thumbnail_url ? { uri: predica.thumbnail_url } : PLACEHOLDER}
        style={[styles.thumbnail, { backgroundColor: surfaceMuted }]}
        resizeMode="cover"
      />

      <View style={styles.cardBody}>
        <Text
          style={[styles.cardTitle, { color: isActive ? primary : text }]}
          numberOfLines={2}
        >
          {predica.titulo}
        </Text>
        <Text style={[styles.cardPredicador, { color: textSecondary }]} numberOfLines={1}>
          {predica.predicador}
        </Text>
        <Text style={[styles.cardMeta, { color: textSecondary }]} numberOfLines={1}>
          {meta.join(' · ')}
          {predica.referencia_biblica ? ` · ${predica.referencia_biblica}` : ''}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: primary }]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? `Pausar ${predica.titulo}` : `Reproducir ${predica.titulo}`}
      >
        <MaterialCommunityIcons name={iconName} size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </Card>
  );
};

const SkeletonCard = () => (
  <Card padding={Spacing.lg} style={styles.card}>
    <Skeleton width={60} height={60} borderRadius={Radii.sm} />
    <View style={styles.cardBody}>
      <Skeleton width="90%" height={15} />
      <Skeleton width="55%" height={12} style={{ marginTop: Spacing.sm }} />
      <Skeleton width="70%" height={11} style={{ marginTop: Spacing.sm }} />
    </View>
    <Skeleton width={44} height={44} borderRadius={22} />
  </Card>
);

const Predicas = () => {
  const insets = useSafeAreaInsets();
  const { predicas, loading, refreshing, error, refetch, retry } = usePredicas();
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const [startingId, setStartingId] = useState<string | null>(null);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');

  const state = playbackState.state;

  const handlePress = async (predica: Predica) => {
    try {
      if (activeTrack?.id === predica.id) {
        // Ya es el track activo: alternar play/pausa
        if (state === State.Playing) {
          const { position } = await TrackPlayer.getProgress();
          savePosition(predica.id, position);
          await TrackPlayer.pause();
        } else {
          await TrackPlayer.play();
        }
        return;
      }
      setStartingId(predica.id);
      await playPredica(predica);
    } catch (e) {
      console.warn('Error al reproducir la prédica:', e);
    } finally {
      setStartingId(null);
    }
  };

  const header = (
    <View style={styles.headerRow}>
      <View style={styles.headerText}>
        <Text style={[styles.title, { color: text }]}>Prédicas</Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          Escuchá los mensajes cuando quieras
        </Text>
      </View>
      <IconCircle name="podcast" />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {loading ? (
        <View style={[styles.contentContainer, { paddingTop: insets.top + Spacing.lg }]}>
          {header}
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : error ? (
        <View style={[styles.contentContainer, { paddingTop: insets.top + Spacing.lg }]}>
          {header}
          <Card padding={Spacing.xl} style={styles.errorCard}>
            <MaterialCommunityIcons name="wifi-off" size={32} color={textSecondary} />
            <Text style={[styles.errorText, { color: textSecondary }]}>
              No se pudieron cargar las prédicas. Revisá tu conexión.
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: primary }]}
              onPress={retry}
              accessibilityRole="button"
              accessibilityLabel="Reintentar cargar prédicas"
            >
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </Card>
        </View>
      ) : (
        <FlatList
          data={predicas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PredicaCard
              predica={item}
              isActive={activeTrack?.id === item.id}
              isPlaying={activeTrack?.id === item.id && state === State.Playing}
              isBusy={
                startingId === item.id ||
                (activeTrack?.id === item.id &&
                  (state === State.Buffering || state === State.Loading))
              }
              onPress={() => handlePress(item)}
            />
          )}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              Todavía no hay prédicas publicadas.
            </Text>
          }
          contentContainerStyle={[
            styles.contentContainer,
            { paddingTop: insets.top + Spacing.lg, paddingBottom: LIST_BOTTOM_PADDING },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refetch}
              colors={[primary]}
              tintColor={primary}
              progressViewOffset={insets.top}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <PredicaMiniPlayer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  headerText: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  title: {
    ...Typography.title,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: Radii.sm,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    fontWeight: '700',
  },
  cardPredicador: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  cardMeta: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
  },
  retryText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});

export default Predicas;
