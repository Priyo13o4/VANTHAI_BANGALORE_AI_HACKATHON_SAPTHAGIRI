/// <reference types="vite/client" />
/**
 * src/config/ws.ts
 * ─────────────────
 * SINGLE source for all API and WebSocket endpoint URLs.
 */
export const WS_ENDPOINTS = {
  cloudcare: {
    chat:  import.meta.env.VITE_HTTP_CLOUDCARE_CHAT as string,
    voice: import.meta.env.VITE_WS_CLOUDCARE_VOICE as string,
  },
  itr: {
    chat:  import.meta.env.VITE_HTTP_ITR_CHAT as string,
    voice: import.meta.env.VITE_WS_ITR_VOICE as string,
  },
} as const;

export type AppName = keyof typeof WS_ENDPOINTS;
export type WSMode  = 'chat' | 'voice';
