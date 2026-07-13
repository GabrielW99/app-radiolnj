import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchJson } from './http';

export type Predica = {
  id: string;
  titulo: string;
  predicador: string;
  descripcion: string | null;
  referencia_biblica: string | null;
  fecha: string; // YYYY-MM-DD
  audio_duracion: number | null; // segundos
  audio_url: string;
  thumbnail_url: string | null;
  estado: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

const PREDICAS_URL = 'https://radiolnj-api.gabrielblanco2399.workers.dev/predicas';

export async function getPredicas(): Promise<Predica[]> {
  const response = await fetchJson<{ data: Predica[] }>(PREDICAS_URL);
  return response.data ?? [];
}

// ── Posición de escucha (retomar donde quedó) ────────────────────────────────

const positionKey = (id: string) => `@predica_pos:${id}`;

export async function getSavedPosition(id: string): Promise<number> {
  try {
    const saved = await AsyncStorage.getItem(positionKey(id));
    const value = Number(saved);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function savePosition(id: string, positionSeconds: number) {
  AsyncStorage.setItem(positionKey(id), String(Math.floor(positionSeconds))).catch(() => {});
}

export function clearPosition(id: string) {
  AsyncStorage.removeItem(positionKey(id)).catch(() => {});
}
