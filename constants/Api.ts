const API_BASE = 'https://radiolnj-api.gabrielblanco2399.workers.dev';

export const Api = {
  nowPlaying: 'https://api.radiolnj.com.ar/nowplaying',
  predicas: `${API_BASE}/predicas`,
  programas: `${API_BASE}/programas`,
  registerPushToken: 'https://n8n-master-n8n.jszr3h.easypanel.host/webhook/radio-lnj/register-token',
  liveStream: 'https://server.radiostreaming.com.ar/8058/stream',
} as const;
