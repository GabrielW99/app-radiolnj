import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Track,
} from 'react-native-track-player';

import { clearPosition, getSavedPosition, type Predica } from './predicas';
import { Api } from '@/constants/Api';

export const RADIO_TRACK_ID = 'radio-live';

export const LIVE_STREAM_TRACK: Track = {
  id: RADIO_TRACK_ID,
  url: Api.liveStream,
  title: 'Radio LNJ',
  artist: '100.9 FM',
  artwork: require('@/assets/images/ministeriologo.png'),
  isLiveStream: true,
};

const RADIO_CAPABILITIES = [Capability.Play, Capability.Stop];

const PREDICA_CAPABILITIES = [
  Capability.Play,
  Capability.Pause,
  Capability.SeekTo,
  Capability.JumpForward,
  Capability.JumpBackward,
];

let setupPromise: Promise<void> | null = null;

/**
 * Inicializa TrackPlayer una única vez. Llamadas concurrentes o repetidas
 * comparten la misma promesa; si el setup falla, se permite reintentar.
 */
export function setupPlayerOnce(): Promise<void> {
  if (!setupPromise) {
    setupPromise = doSetup().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }
  return setupPromise;
}

async function doSetup(): Promise<void> {
  await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });

  await applyCapabilities(RADIO_CAPABILITIES);

  const queue = await TrackPlayer.getQueue();
  if (queue.length === 0) {
    await TrackPlayer.add(LIVE_STREAM_TRACK);
  }
}

async function applyCapabilities(capabilities: Capability[]): Promise<void> {
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
    forwardJumpInterval: 15,
    backwardJumpInterval: 15,
    capabilities,
    compactCapabilities: capabilities,
    notificationCapabilities: capabilities,
    icon: require('@/assets/images/ministeriologo.png'),
  });
}

/** Id del track activo, o undefined si no hay queue cargada. */
export async function getActiveTrackId(): Promise<string | undefined> {
  const track = await TrackPlayer.getActiveTrack();
  return track?.id;
}

/**
 * Reproduce la radio en vivo. Si venía sonando una prédica,
 * resetea la queue y vuelve a la fuente de radio.
 */
export async function playRadio(): Promise<void> {
  await setupPlayerOnce();
  const activeId = await getActiveTrackId();
  if (activeId !== RADIO_TRACK_ID) {
    await TrackPlayer.reset();
    await TrackPlayer.add(LIVE_STREAM_TRACK);
    await applyCapabilities(RADIO_CAPABILITIES);
    await TrackPlayer.setRate(1);
  }
  await TrackPlayer.play();
}

/**
 * Reproduce una prédica (detiene la radio si estaba sonando).
 * Retoma desde la posición guardada, salvo que ya estuviera casi terminada.
 */
export async function playPredica(predica: Predica): Promise<void> {
  await setupPlayerOnce();
  await TrackPlayer.reset();
  await TrackPlayer.add({
    id: predica.id,
    url: predica.audio_url,
    title: predica.titulo,
    artist: predica.predicador,
    artwork: predica.thumbnail_url || require('@/assets/images/ministeriologo.png'),
    duration: predica.audio_duracion ?? undefined,
  });
  await applyCapabilities(PREDICA_CAPABILITIES);
  await TrackPlayer.setRate(1);

  let fromPosition = await getSavedPosition(predica.id);
  const duracion = predica.audio_duracion;
  if (duracion && fromPosition > duracion - 30) {
    // Ya la terminó: arrancar de cero
    clearPosition(predica.id);
    fromPosition = 0;
  }
  if (fromPosition > 0) {
    await TrackPlayer.seekTo(fromPosition);
  }
  await TrackPlayer.play();
}
