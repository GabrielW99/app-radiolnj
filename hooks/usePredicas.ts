import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getPredicas, type Predica } from '@/services/predicas';

const CACHE_KEY = '@predicas_cache';

/**
 * Lista de prédicas offline-first: muestra la última respuesta cacheada al
 * instante y refresca de red en paralelo. `error` solo se activa si no hay
 * nada para mostrar.
 */
export function usePredicas() {
  const [predicas, setPredicas] = useState<Predica[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const hasDataRef = useRef(false);

  const fetchFromNetwork = useCallback(async () => {
    try {
      const data = await getPredicas();
      hasDataRef.current = true;
      setPredicas(data);
      setError(false);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)).catch(() => {});
    } catch (e) {
      console.warn('Error al cargar prédicas:', e);
      // Solo es error visible si no tenemos nada (ni caché ni red)
      if (!hasDataRef.current) setError(true);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (active && cached) {
          const data: Predica[] = JSON.parse(cached);
          if (Array.isArray(data) && data.length > 0) {
            hasDataRef.current = true;
            setPredicas(data);
            setLoading(false);
          }
        }
      } catch {
        // Caché corrupta: se ignora y se pisa con la red
      }
      await fetchFromNetwork();
      if (active) setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [fetchFromNetwork]);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    await fetchFromNetwork();
    setRefreshing(false);
  }, [fetchFromNetwork]);

  const retry = useCallback(async () => {
    setLoading(true);
    setError(false);
    await fetchFromNetwork();
    setLoading(false);
  }, [fetchFromNetwork]);

  return { predicas, loading, refreshing, error, refetch, retry };
}
