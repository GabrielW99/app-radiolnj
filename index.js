import 'expo-router/entry';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './services/PlaybackService';

// El servicio debe registrarse fuera del ciclo de vida de React para que
// Android pueda lanzarlo aunque la app esté cerrada (control por notificación).
TrackPlayer.registerPlaybackService(() => PlaybackService);
