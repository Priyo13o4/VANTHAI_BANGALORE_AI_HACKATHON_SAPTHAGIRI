import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAIDispatcher } from '../../hooks/useAIDispatcher';
import { CLOUDCARE_ALLOWED } from '../../apps/cloudcare/tours/index';
import { ITR_ALLOWED } from '../../apps/itr/tours/index';
import { WS_ENDPOINTS } from '../../config/ws';
import type { ActionEnvelope, WSEnvelope } from '../../types/ws';
import { Bot, X, Mic, MicOff, Send, RotateCcw, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';

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
  
  const STORAGE_KEY = `vanthai_chat_history_${app}`;
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    return [
      { id: '0', role: 'assistant', content: `Hi! I'm Vanth AI — your intelligent ${app === 'cloudcare' ? 'health' : 'tax filing'} assistant. How can I assist you today?` },
    ];
  });

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  
  const streamingIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Persist messages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, STORAGE_KEY]);

  // Scroll to bottom
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, isThinking]);

  const allowedElements = app === 'cloudcare' ? CLOUDCARE_ALLOWED : ITR_ALLOWED;
  const { dispatch } = useAIDispatcher({ app, allowedElements });

  const wsUrl = isVoiceMode ? WS_ENDPOINTS[app].voice : WS_ENDPOINTS[app].chat;

  const handleEnvelope = useCallback(
    (envelope: WSEnvelope) => {
      switch (envelope.type) {
        case 'session_init':
          break;

        case 'thinking':
          setIsThinking(true);
          break;

        case 'tool_call':
          setIsThinking(false);
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
              { id: newId, role: 'assistant', content: envelope.content, isStreaming: true, toolCalls: [] },
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
          break;
        }

        case 'action': {
          setIsThinking(false);
          const actionEnv = envelope as ActionEnvelope;
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
              { id: crypto.randomUUID(), role: 'assistant', content: actionEnv.message, toolCalls: [] },
            ]);
          }
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
    if (connectionState !== 'connected') {
      console.warn('Cannot send message: Not connected to Vanth AI');
      return;
    }
    setIsThinking(true);
    sendMessage(text);
  };

  const handleClearChat = () => {
    setMessages([
      { id: '0', role: 'assistant', content: `Hi! I'm Vanth AI — your intelligent ${app === 'cloudcare' ? 'health' : 'tax filing'} assistant. How can I assist you today?` },
    ]);
    setExpandedThinking({});
  };

  const toggleThinkingBox = (id: string) => {
    setExpandedThinking(prev => ({ ...prev, [id]: !prev[id] }));
  };

  /* ── Soundwave bars for voice mode ── */
  const waveBars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <>
      {/* ── Soundwave Keyframes ── */}
      <style>{`
        @keyframes vanthai-wave {
          0%, 100% { transform: scaleY(0.25); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      {/* ── Floating Toggle ── */}
      <button
        data-vanthai-id="vanthai-chat-toggle"
        onClick={() => setOpen((p) => !p)}
        className={clsx(
          'fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-300 ease-out hover:scale-105 active:scale-95',
          'shadow-lg shadow-teal-900/20 ring-1 ring-teal-600/30',
          open ? 'bg-slate-700 ring-slate-600/30 rotate-45' : 'bg-teal-700'
        )}
        title="Vanth AI Assistant"
      >
        {open ? <X size={22} /> : <Bot size={24} />}
      </button>

      {/* ── Chat Panel ── */}
      <div
        data-vanthai-id="vanthai-chat-panel"
        className={clsx(
          'fixed z-[9999] flex flex-col overflow-hidden transition-all duration-400 ease-out origin-bottom-right',
          'bg-teal-50 border border-teal-200/60 shadow-2xl shadow-teal-900/10',
          // Desktop
          'sm:bottom-5 sm:right-6 sm:w-[420px] sm:h-[calc(100vh-40px)] sm:rounded-2xl',
          // Mobile
          'bottom-0 right-0 w-full h-full rounded-none sm:rounded-2xl',
          open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        )}
      >
        {/* ── Header ── */}
        <div className="px-5 py-4 border-b border-teal-200/50 bg-teal-100/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white ring-1 ring-teal-600/40 shadow-sm">
                <Bot size={18} />
              </div>
              {connectionState === 'connected' && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-teal-50 rounded-full"></span>
              )}
            </div>
            <div>
              <div className="text-slate-900 font-semibold text-sm tracking-tight">Vanth AI</div>
              <div className={clsx('text-xs font-medium', connectionState === 'connected' ? 'text-emerald-600' : 'text-slate-400')}>
                {connectionState === 'connected' ? 'Online' : connectionState === 'connecting' ? 'Connecting…' : 'Offline'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-2 text-teal-600/60 hover:text-teal-800 hover:bg-teal-100 rounded-lg transition-colors"
              title="New Chat"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-teal-600/60 hover:text-teal-800 hover:bg-teal-100 rounded-lg transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-gradient-to-b from-teal-50/50 to-teal-50">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={clsx(
                'max-w-[85%] px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-teal-700 text-white rounded-2xl rounded-br-md shadow-sm shadow-teal-900/10 ring-1 ring-teal-600/20'
                  : 'bg-white border border-teal-200/60 text-slate-800 rounded-2xl rounded-bl-md shadow-sm shadow-teal-200/30'
              )}>
                
                {/* Content */}
                <div className="break-words">
                  {msg.content}
                  {msg.isStreaming && <span className="inline-block w-1.5 h-4 bg-teal-500 ml-1 rounded-sm animate-pulse" />}
                </div>

                {/* Thinking Dropdown */}
                {msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-teal-100/80">
                    <button
                      onClick={() => toggleThinkingBox(msg.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-teal-700 transition-colors"
                    >
                      <BrainCircuit size={13} />
                      {expandedThinking[msg.id] ? 'Hide process' : 'Show process'}
                      {expandedThinking[msg.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    
                    {expandedThinking[msg.id] && (
                      <div className="mt-2 space-y-1.5 bg-teal-50/80 rounded-lg p-2.5 border border-teal-100/60">
                        {msg.toolCalls.map((tc, i) => {
                          const isSuccess = tc.includes('(success)');
                          const isError = tc.includes('(error)');
                          
                          return (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <span className={clsx(
                                "mt-0.5 w-1.5 h-1.5 rounded-full shrink-0",
                                isSuccess ? "bg-emerald-500" : isError ? "bg-red-400" : "bg-teal-500 animate-pulse"
                              )}></span>
                              <span className="text-slate-500 font-mono tracking-tight">{tc.replace(' (success)', '').replace(' (error)', '')}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Thinking State */}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-white border border-teal-200/60 rounded-2xl rounded-bl-md px-4 py-3 text-sm flex items-center gap-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-slate-400 text-xs font-medium">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-1" />
        </div>

        {/* ── Input Area ── */}
        <div className="p-4 bg-teal-100/40 border-t border-teal-200/50">
          {isVoiceMode ? (
            /* ── Voice Listening Mode ── */
            <div className="flex flex-col items-center py-5">
              {/* Soundwave Visualization */}
              <div className="flex items-center justify-center gap-[5px] h-16 mb-4">
                {waveBars.map((i) => (
                  <div
                    key={i}
                    className="w-[4px] rounded-full bg-teal-500"
                    style={{
                      height: '100%',
                      animation: 'vanthai-wave 1.2s ease-in-out infinite',
                      animationDelay: `${i * 0.15}s`,
                      transformOrigin: 'center',
                      opacity: 0.5 + (i % 3) * 0.15,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-teal-700 font-medium tracking-wide mb-4">Listening…</p>
              {/* Stop Button */}
              <button
                onClick={() => setIsVoiceMode(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 rounded-xl border border-teal-200/80 shadow-sm hover:bg-teal-50 transition-colors text-sm font-medium ring-1 ring-teal-200/40"
              >
                <MicOff size={16} />
                Stop listening
              </button>
            </div>
          ) : (
            /* ── Text Input Mode ── */
            <div className="relative flex items-end gap-2 bg-white rounded-xl border border-teal-200/60 p-1.5 transition-all focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 focus-within:shadow-sm">
              <textarea
                data-vanthai-id="vanthai-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything…"
                className="flex-1 max-h-32 min-h-[44px] bg-transparent text-slate-800 px-3 py-2.5 text-sm outline-none resize-none placeholder-slate-400"
                rows={1}
              />
              {/* Mic Button — Equal prominence */}
              <button
                data-vanthai-id="vanthai-voice-toggle"
                onClick={() => setIsVoiceMode(true)}
                className="p-2.5 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors shrink-0 mb-0.5 ring-1 ring-teal-200/60"
                title="Voice input"
              >
                <Mic size={16} />
              </button>
              {/* Send Button */}
              <button
                data-vanthai-id="vanthai-chat-send"
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 bg-teal-700 text-white rounded-lg hover:bg-teal-600 disabled:opacity-25 transition-colors shrink-0 mb-0.5 mr-0.5 ring-1 ring-teal-600/30"
              >
                <Send size={16} />
              </button>
            </div>
          )}
          
          <div className="mt-3 text-center">
            <p className="text-[10px] text-teal-600/50 tracking-wide">Vanth AI may make mistakes · Verify important information</p>
          </div>
        </div>
      </div>
    </>
  );
}
