import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { fetchJson } from '@/services/http';
import { Api } from '@/constants/Api';
const POLL_INTERVAL_MS = 20000;

/**
 * Consulta periódicamente el tema que está sonando en la radio.
 * Solo pollea con la app en foreground; ante un error de red se
 * conserva el último título conocido.
 */
export function useNowPlaying() {
  const [titulo, setTitulo] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchNowPlaying = async () => {
      try {
        const data = await fetchJson<{ titulo?: string }>(Api.nowPlaying);
        if (active && data.titulo) {
          setTitulo(data.titulo);
        }
      } catch {
        // Silencioso: se mantiene el último título conocido
      }
    };

    const startPolling = () => {
      if (intervalId !== null) return;
      fetchNowPlaying();
      intervalId = setInterval(fetchNowPlaying, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Pollea solo en foreground para no gastar batería/datos en background.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        startPolling();
      } else {
        stopPolling();
      }
    });

    if (AppState.currentState === 'active') {
      startPolling();
    }

    return () => {
      active = false;
      stopPolling();
      subscription.remove();
    };
  }, []);

  return titulo;
}
