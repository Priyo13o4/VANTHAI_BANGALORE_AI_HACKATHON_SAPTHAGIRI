/**
 * src/types/api.ts
 * Ported from ERP-SIH types/api.ts — extended with ActionPayload + WSEnvelope re-export.
 */

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// ── ActionPayload — matches backend ActionPayload exactly ─────────────────────
// Backward-compatible with ERP-SIH: action:navigate and action:fillForm preserved.

export interface ActionPayload {
  message: string;
  message_type: 'text' | 'quick_reply' | 'step_flow' | 'mermaid';
  action: 'navigate' | 'highlight' | 'autofill' | 'navigate+tour' | 'fillForm' | 'none';
  url?: string | null;
  tour?: string | null;
  element?: string | null;
  popover?: { title: string; description: string } | null;
  fill_data?: Record<string, string> | null;
  data?: Record<string, string> | null;  // ERP-SIH compat alias for fill_data
  options?: string[] | null;
  fieldsNeedingAttention?: string[] | null;
}

// Re-export WS types for convenience
export type { WSEnvelope, ConnectionState } from './ws';
