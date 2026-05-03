/**
 * src/types/ws.ts
 * All WebSocket envelope type definitions.
 * These map 1:1 to the backend WS streaming envelope types.
 */

// ── Envelope types received FROM backend ──────────────────────────────────────

export interface SessionInitEnvelope {
  type: 'session_init';
  session_id: string;
}

export interface ThinkingEnvelope {
  type: 'thinking';
  content: string;
}

export interface ToolCallEnvelope {
  type: 'tool_call';
  name: string;
  args: Record<string, unknown>;
  status: 'running' | 'done';
  result_preview?: string;
}

export interface TokenEnvelope {
  type: 'token';
  content: string;
}

export interface ActionEnvelope {
  type: 'action';
  message: string;
  message_type: 'text' | 'quick_reply' | 'step_flow' | 'mermaid';
  action: 'navigate' | 'highlight' | 'spotlight' | 'autofill' | 'navigate+tour' | 'fillForm' | 'clearHighlight' | 'none';
  url?: string | null;
  tour?: string | null;
  element?: string | null;
  popover?: { title: string; description: string } | null;
  fill_data?: Record<string, string> | null;  // maps to ERP-SIH parsed.data
  options?: string[] | null;
  fields_needing_attention?: string[] | null;
}

export interface DoneEnvelope {
  type: 'done';
}

export interface ErrorEnvelope {
  type: 'error';
  message: string;
}

export type WSEnvelope =
  | SessionInitEnvelope
  | ThinkingEnvelope
  | ToolCallEnvelope
  | TokenEnvelope
  | ActionEnvelope
  | DoneEnvelope
  | ErrorEnvelope;

// ── Outbound message (frontend → backend) ─────────────────────────────────────

export interface OutboundMessage {
  text: string;
  current_page: string;
}

// ── Connection state ───────────────────────────────────────────────────────────

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';
