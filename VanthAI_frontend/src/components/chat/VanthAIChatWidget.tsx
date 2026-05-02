/**
 * VanthAIChatWidget.tsx
 * Extended from ERP-SIH components/ai/AIChat.tsx
 *
 * Changes from ERP-SIH:
 *  ✅ sendToN8n() DELETED — all communication via useWebSocket
 *  ✅ handleSendMessage() dispatcher extracted to useAIDispatcher
 *  ✅ Shared by both CloudCare and ITR apps via `app` prop
 *  ✅ Streams: thinking → tool_call → token → action → done
 *  ✅ Voice orb button (placeholder — wired in Phase 4c)
 *  ✅ data-vanthai-id convention
 */
import { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAIDispatcher } from '../../hooks/useAIDispatcher';
import { CLOUDCARE_ALLOWED } from '../../apps/cloudcare/tours/index';
import { ITR_ALLOWED } from '../../apps/itr/tours/index';
import { WS_ENDPOINTS } from '../../config/ws';
import type { ActionEnvelope, WSEnvelope } from '../../types/ws';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  toolCalls?: string[];
}

interface Props {
  app: 'cloudcare' | 'itr';
}

export default function VanthAIChatWidget({ app }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: `Hi! I'm VanthAI — your ${app === 'cloudcare' ? 'health' : 'tax filing'} assistant. How can I help you today?` },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const streamingIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const allowedElements = app === 'cloudcare' ? CLOUDCARE_ALLOWED : ITR_ALLOWED;
  const { dispatch } = useAIDispatcher({ app, allowedElements });

  const wsUrl = WS_ENDPOINTS[app].chat;

  const handleEnvelope = useCallback(
    (envelope: WSEnvelope) => {
      switch (envelope.type) {
        case 'session_init':
          // session_id stored in useWebSocket — nothing to do here
          break;

        case 'thinking':
          setIsThinking(true);
          break;

        case 'tool_call':
          setIsThinking(false);
          // Append tool call status to current streaming message's tool calls
          if (streamingIdRef.current) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingIdRef.current
                  ? { ...m, toolCalls: [...(m.toolCalls ?? []), `${envelope.name} (${envelope.status})`] }
                  : m
              )
            );
          }
          break;

        case 'token': {
          setIsThinking(false);
          if (!streamingIdRef.current) {
            const newId = crypto.randomUUID();
            streamingIdRef.current = newId;
            setMessages((prev) => [
              ...prev,
              { id: newId, role: 'assistant', content: envelope.content, isStreaming: true },
            ]);
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingIdRef.current
                  ? { ...m, content: m.content + envelope.content }
                  : m
              )
            );
          }
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          break;
        }

        case 'action': {
          setIsThinking(false);
          const actionEnv = envelope as ActionEnvelope;
          // Finalize the streaming message with the action's message text
          if (streamingIdRef.current) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingIdRef.current
                  ? { ...m, content: actionEnv.message || m.content, isStreaming: false }
                  : m
              )
            );
            streamingIdRef.current = null;
          } else if (actionEnv.message) {
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), role: 'assistant', content: actionEnv.message },
            ]);
          }
          // Dispatch navigation / highlight / autofill / tour
          dispatch(actionEnv);
          break;
        }

        case 'done':
          setIsThinking(false);
          if (streamingIdRef.current) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingIdRef.current ? { ...m, isStreaming: false } : m
              )
            );
            streamingIdRef.current = null;
          }
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          break;

        case 'error':
          setIsThinking(false);
          streamingIdRef.current = null;
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: 'assistant', content: `⚠️ Error: ${envelope.message}` },
          ]);
          break;
      }
    },
    [dispatch]
  );

  const { sendMessage, connectionState } = useWebSocket({ url: wsUrl, onMessage: handleEnvelope });

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: text },
    ]);
    setIsThinking(true);
    sendMessage(text);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        data-vanthai-id="vanthai-chat-toggle"
        onClick={() => setOpen((p) => !p)}
        className={clsx(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all duration-300',
          open ? 'bg-gray-800 text-white rotate-45' : 'bg-blue-600 text-white hover:bg-blue-700'
        )}
        title="VanthAI Assistant"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          data-vanthai-id="vanthai-chat-panel"
          className="fixed bottom-24 right-6 z-50 w-96 h-[560px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center gap-3">
            <span className="text-xl">🤖</span>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">VanthAI Assistant</div>
              <div className={clsx('text-xs', connectionState === 'connected' ? 'text-blue-200' : 'text-yellow-200')}>
                {connectionState === 'connected' ? '● Live' : connectionState === 'connecting' ? '⟳ Connecting…' : '○ Offline'}
              </div>
            </div>
            {/* Voice orb button (placeholder) */}
            <button
              data-vanthai-id="vanthai-voice-toggle"
              className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
              title="Voice mode (Phase 4c)"
              onClick={() => alert('Voice mode coming in Phase 4c')}
            >
              🎙️
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={clsx(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                )}>
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="text-xs text-gray-500 mb-1 space-y-0.5">
                      {msg.toolCalls.map((tc, i) => <div key={i}>🔧 {tc}</div>)}
                    </div>
                  )}
                  {msg.content}
                  {msg.isStreaming && <span className="inline-block w-1.5 h-4 bg-current ml-1 animate-pulse" />}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
                  <span className="animate-pulse">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 flex gap-2">
            <input
              data-vanthai-id="vanthai-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={`Ask about your ${app === 'cloudcare' ? 'health…' : 'tax return…'}`}
              disabled={connectionState !== 'connected'}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
            <button
              data-vanthai-id="vanthai-chat-send"
              onClick={handleSend}
              disabled={!input.trim() || connectionState !== 'connected'}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
