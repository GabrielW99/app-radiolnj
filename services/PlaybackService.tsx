import TrackPlayer, { Event } from 'react-native-track-player';

import { clearPosition } from './predicas';
import { RADIO_TRACK_ID } from './player';

const JUMP_SECONDS = 15;

export const PlaybackService = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());

  // Radio en vivo: "pausar" es detener (no acumular buffer); prédicas: pausa real.
  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    const track = await TrackPlayer.getActiveTrack();
    if (track?.id === RADIO_TRACK_ID) {
      await TrackPlayer.stop();
    } else {
      await TrackPlayer.pause();
    }
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    TrackPlayer.seekTo(event.position);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async () => {
    const { position } = await TrackPlayer.getProgress();
    await TrackPlayer.seekTo(position + JUMP_SECONDS);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async () => {
    const { position } = await TrackPlayer.getProgress();
    await TrackPlayer.seekTo(Math.max(0, position - JUMP_SECONDS));
  });

  // Prédica terminada: olvidar la posición guardada para arrancar de cero
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
    const track = await TrackPlayer.getActiveTrack();
    if (track?.id && track.id !== RADIO_TRACK_ID) {
      clearPosition(track.id);
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
    console.warn('Error de reproducción:', error);
  });
};
