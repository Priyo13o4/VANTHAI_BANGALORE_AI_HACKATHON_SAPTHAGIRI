/**
 * src/hooks/useWebSocket.ts
 * WS lifecycle hook — replaces sendToN8n() from ERP-SIH AIChat.tsx.
 *
 * CRITICAL RULES:
 *  - Session ID arrives from server's first WS frame { type: "session_init" }
 *  - Session ID stored in React state ONLY — never localStorage, never sessionStorage
 *  - No reconnect on close: page reload = new WS = new session (intentional)
 *  - beforeunload closes WS → triggers backend DEL session:{id}
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ConnectionState, OutboundMessage, WSEnvelope } from '../types/ws';

interface UseWebSocketOptions {
  url: string;
  onMessage: (envelope: WSEnvelope) => void;
}

interface UseWebSocketReturn {
  sendMessage: (text: string) => void;
  connectionState: ConnectionState;
  sessionId: string | null;
}

export function useWebSocket({ url, onMessage }: UseWebSocketOptions): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  // Session ID in component state ONLY — never localStorage/sessionStorage
  const [sessionId, setSessionId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;
    setConnectionState('connecting');

    ws.onopen = () => {
      setConnectionState('connected');
    };

    ws.onmessage = (event) => {
      try {
        const envelope: WSEnvelope = JSON.parse(event.data as string);
        // First frame must be session_init — store session_id in state only
        if (envelope.type === 'session_init') {
          setSessionId(envelope.session_id);
        }
        onMessage(envelope);
      } catch (err) {
        console.error('[useWebSocket] Failed to parse WS message', err);
      }
    };

    ws.onerror = () => {
      setConnectionState('error');
    };

    ws.onclose = () => {
      setConnectionState('disconnected');
      setSessionId(null);
    };

    // beforeunload: close WS → backend DEL session:{id}
    const handleBeforeUnload = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'page_unload');
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      ws.close(1000, 'component_unmount');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.warn('[useWebSocket] Cannot send — WS not open');
        return;
      }
      const outbound: OutboundMessage = {
        text,
        current_page: location.pathname,
      };
      wsRef.current.send(JSON.stringify(outbound));
    },
    [location.pathname]
  );

  return { sendMessage, connectionState, sessionId };
}
