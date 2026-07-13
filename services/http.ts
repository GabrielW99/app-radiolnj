const DEFAULT_TIMEOUT_MS = 10000;

/**
 * fetch con timeout y validación de status HTTP.
 * Lanza error si la respuesta no es 2xx o si supera el timeout.
 */
export async function fetchJson<T>(url: string, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} al pedir ${url}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}
