/// <reference types="vite/client" />
/**
 * src/config/ws.ts
 * ─────────────────
 * SINGLE source for all WebSocket endpoint URLs.
 * All values come from import.meta.env (VITE_* prefix).
 * NO WebSocket URL appears anywhere else in the codebase.
 *
 * Hard constraint: Never hardcode ws:// or wss:// strings outside this file.
 */
export const WS_ENDPOINTS = {
  cloudcare: {
    chat:  import.meta.env.VITE_WS_CLOUDCARE_CHAT  as string,
    voice: import.meta.env.VITE_WS_CLOUDCARE_VOICE as string,
  },
  itr: {
    chat:  import.meta.env.VITE_WS_ITR_CHAT  as string,
    voice: import.meta.env.VITE_WS_ITR_VOICE as string,
  },
} as const;

export type AppName = keyof typeof WS_ENDPOINTS;
export type WSMode  = 'chat' | 'voice';
