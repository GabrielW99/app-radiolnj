import TrackPlayer, { Event } from 'react-native-track-player';

export const PlaybackService = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  // Radio en vivo: "pausar" es detener; al reanudar se reconecta al vivo.
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
    console.warn('Error de reproducción:', error);
  });
};
