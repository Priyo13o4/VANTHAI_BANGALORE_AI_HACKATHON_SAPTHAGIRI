import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ConnectionState, WSEnvelope } from '../types/ws';

interface UseChatApiOptions {
  url: string | null;
  onMessage: (envelope: WSEnvelope) => void;
}

interface UseChatApiReturn {
  sendMessage: (text: string) => void;
  connectionState: ConnectionState;
  sessionId: string | null;
}

export function useChatApi({ url, onMessage }: UseChatApiOptions): UseChatApiReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connected');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const location = useLocation();

  const sendMessage = useCallback(
    async (text: string) => {
      if (!url) return;

      // Convert ws:// to http://
      const httpUrl = url.replace(/^ws(s?):\/\//i, 'http$1://');

      try {
        setConnectionState('connected');
        const response = await fetch(httpUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            current_page: location.pathname,
            session_id: sessionId,
          }),
        });

        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let buffer = '';

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            let lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Keep the incomplete chunk in the buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                try {
                  const envelope: WSEnvelope = JSON.parse(jsonStr);
                  if (envelope.type === 'session_init') {
                    setSessionId(envelope.session_id);
                  }
                  onMessage(envelope);
                } catch (e) {
                  console.error('Failed to parse SSE JSON', e, jsonStr);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('SSE Error:', err);
        setConnectionState('error');
        onMessage({ type: 'error', message: String(err) } as any);
      }
    },
    [url, location.pathname, sessionId, onMessage]
  );

  return { sendMessage, connectionState, sessionId };
}
