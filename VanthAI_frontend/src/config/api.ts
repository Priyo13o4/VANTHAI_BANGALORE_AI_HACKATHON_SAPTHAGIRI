/**
 * src/config/api.ts
 * Ported from ERP-SIH config/api.ts — HTTP REST endpoints.
 * WS endpoints are in config/ws.ts (separate file, separate concern).
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN:   '/api/auth/login',
    LOGOUT:  '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  AI: {
    // Legacy n8n endpoint removed — all AI communication is WebSocket only.
    // See config/ws.ts for WS endpoints.
  },
} as const;
