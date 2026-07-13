import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Track,
} from 'react-native-track-player';

export const LIVE_STREAM_TRACK: Track = {
  id: '1',
  url: 'https://server.radiostreaming.com.ar/8058/stream',
  title: 'Radio LNJ',
  artist: '100.9 FM',
  artwork: require('@/assets/images/ministeriologo.png'),
  isLiveStream: true,
};

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

  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
    capabilities: [Capability.Play, Capability.Stop],
    compactCapabilities: [Capability.Play, Capability.Stop],
    notificationCapabilities: [Capability.Play, Capability.Stop],
    icon: require('@/assets/images/ministeriologo.png'),
  });

  const queue = await TrackPlayer.getQueue();
  if (queue.length === 0) {
    await TrackPlayer.add(LIVE_STREAM_TRACK);
  }
}
