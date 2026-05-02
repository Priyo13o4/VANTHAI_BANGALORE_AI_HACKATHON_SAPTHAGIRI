import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useChatApi } from '../../hooks/useChatApi';
import { useAIDispatcher } from '../../hooks/useAIDispatcher';
import { useVoiceStreamer } from '../../hooks/useVoiceStreamer';
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
  const location = useLocation();
  
  const STORAGE_KEY = `vanthai_chat_history_${app}_teal_v3`;
  
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

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [open, messages, isThinking]);

  // ── Dispatcher (Tools) ──
  const allowedRoutes = app === 'cloudcare' ? CLOUDCARE_ALLOWED : ITR_ALLOWED;
  const { dispatchAction } = useAIDispatcher({ allowedRoutes });

  // ── Text Handler (HTTP/SSE via useChatApi) ──
  const onChatMessage = useCallback((envelope: WSEnvelope) => {
    if (envelope.type === 'token') {
      setIsThinking(false);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && last.id === streamingIdRef.current) {
          return [...prev.slice(0, -1), { ...last, content: last.content + envelope.content }];
        }
        const newId = Math.random().toString(36).substring(7);
        streamingIdRef.current = newId;
        return [...prev, { id: newId, role: 'assistant', content: envelope.content, isStreaming: true }];
      });
    } else if (envelope.type === 'done') {
      setMessages((prev) => prev.map((m) => m.id === streamingIdRef.current ? { ...m, isStreaming: false } : m));
      streamingIdRef.current = null;
      setIsThinking(false);
    } else if (envelope.type === 'thinking') {
      setIsThinking(true);
      if (envelope.content) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && last.id === streamingIdRef.current) {
            const toolCalls = [...(last.toolCalls || []), envelope.content];
            return [...prev.slice(0, -1), { ...last, toolCalls }];
          }
          const newId = Math.random().toString(36).substring(7);
          streamingIdRef.current = newId;
          return [...prev, { id: newId, role: 'assistant', content: '', toolCalls: [envelope.content] }];
        });
      }
    } else if (envelope.type === 'action') {
      dispatchAction(envelope as ActionEnvelope);
    }
  }, [dispatchAction]);

  const { sendMessage, connectionState: chatState } = useChatApi({
    url: WS_ENDPOINTS[app].chat,
    onMessage: onChatMessage,
  });

  // ── Voice Handler (Gemini Live) ──
  const { startSession, stopSession, status: voiceStatus } = useVoiceStreamer({
    url: WS_ENDPOINTS[app].voice,
    onTranscript: (text, role) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.isStreaming && last.role === role) {
          return [...prev.slice(0, -1), { ...last, content: text }];
        }
        return [...prev, { id: Math.random().toString(36).substring(7), role, content: text, isStreaming: true }];
      });
    },
    onFinalTranscript: () => {
      setMessages(prev => prev.map(m => ({ ...m, isStreaming: false })));
    },
    onToolCall: (name, args) => {
      if (name === 'navigate_to' && args.path) {
        dispatchAction({ type: 'action', action: 'navigate', url: args.path } as any);
      }
    }
  });

  const handleToggleVoice = useCallback(async () => {
    if (isVoiceMode) {
      stopSession();
      setIsVoiceMode(false);
    } else {
      setIsVoiceMode(true);
      await startSession();
    }
  }, [isVoiceMode, startSession, stopSession]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }]);
    setInput('');
    
    setIsThinking(true);
    sendMessage(text);
  };

  const handleClearChat = () => {
    setMessages([
      { id: '0', role: 'assistant', content: `Hi! I'm Vanth AI — your intelligent ${app === 'cloudcare' ? 'health' : 'tax filing'} assistant. How can I assist you today?` },
    ]);
    setExpandedThinking({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const toggleThinkingBox = (id: string) => {
    setExpandedThinking(prev => ({ ...prev, [id]: !prev[id] }));
  };

  /* ── Soundwave bars for voice mode ── */
  const waveBars = Array.from({ length: 7 }, (_, i) => i);

  return (
    <>
      <style>{`
        @keyframes vanthai-wave {
          0%, 100% { transform: scaleY(0.3); }
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
      >
        {open ? <X size={22} /> : <Bot size={24} />}
      </button>

      {/* ── Chat Panel ── */}
      <div
        data-vanthai-id="vanthai-chat-panel"
        className={clsx(
          'fixed z-[9999] flex flex-col overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)]',
          'bg-teal-50 border border-teal-200/60 shadow-2xl shadow-teal-900/10',
          // Desktop
          'sm:bottom-5 sm:right-6 sm:w-[420px] sm:h-[calc(100vh-120px)] sm:rounded-3xl',
          // Mobile
          'bottom-0 right-0 w-full h-full rounded-none sm:rounded-3xl',
          open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        )}
      >
        {/* ── Header ── */}
        <div className="px-5 py-5 border-b border-teal-200/50 bg-teal-700 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/30 shadow-sm">
                <Bot size={20} />
              </div>
              {chatState === 'connected' && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-teal-700 rounded-full"></span>
              )}
            </div>
            <div>
              <div className="text-white font-bold text-sm tracking-tight leading-none mb-1">Vanth AI</div>
              <div className={clsx('text-[10px] font-bold uppercase tracking-widest', chatState === 'connected' ? 'text-emerald-300' : 'text-teal-200 animate-pulse')}>
                {chatState === 'connected' ? 'Live Brain' : 'Syncing...'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="New Chat"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 bg-gradient-to-b from-teal-50/50 to-white">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={clsx(
                'max-w-[85%] px-4 py-3 text-[14px] leading-relaxed shadow-sm',
                msg.role === 'user'
                  ? 'bg-teal-700 text-white rounded-2xl rounded-tr-none ring-1 ring-teal-600/20'
                  : 'bg-white border border-teal-100 text-slate-800 rounded-2xl rounded-tl-none ring-1 ring-slate-100'
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
                      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-teal-700 transition-colors uppercase tracking-tight"
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
                            <div key={i} className="flex items-start gap-2 text-[11px]">
                              <span className={clsx(
                                "mt-1 w-1.5 h-1.5 rounded-full shrink-0",
                                isSuccess ? "bg-emerald-500" : isError ? "bg-red-400" : "bg-teal-500 animate-pulse"
                              )}></span>
                              <span className="text-slate-600 font-mono tracking-tight">{tc.replace(' (success)', '').replace(' (error)', '')}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                {msg.role === 'user' ? 'You' : 'Vanth AI'}
              </span>
            </div>
          ))}
          
          {/* Thinking State */}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-white border border-teal-200/60 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-slate-400 text-xs font-medium italic">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-1" />
        </div>

        {/* ── Input Area ── */}
        <div className="p-4 bg-teal-100/20 border-t border-teal-200/50">
          {isVoiceMode ? (
            /* ── Voice Listening Mode ── */
            <div className="flex flex-col items-center py-6 bg-white rounded-2xl shadow-inner border border-teal-100/50">
              {/* Soundwave Visualization */}
              <div className="flex items-center justify-center gap-[6px] h-12 mb-6">
                {waveBars.map((i) => (
                  <div
                    key={i}
                    className="w-[4px] rounded-full bg-teal-500"
                    style={{
                      height: '100%',
                      animation: 'vanthai-wave 1s ease-in-out infinite',
                      animationDelay: `${i * 0.12}s`,
                      transformOrigin: 'center',
                      opacity: 0.6 + (i % 3) * 0.1,
                    }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-teal-700 font-bold tracking-widest mb-6 uppercase">
                {voiceStatus === 'streaming' ? 'Vanth AI is listening…' : 'Connecting Voice…'}
              </p>
              {/* Stop Button */}
              <button
                onClick={handleToggleVoice}
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-900/20 hover:bg-rose-700 transition-all text-xs font-bold uppercase tracking-widest"
              >
                <MicOff size={14} />
                End Conversation
              </button>
            </div>
          ) : (
            /* ── Text Input Mode ── */
            <div className="relative flex items-end gap-2 bg-white rounded-2xl border border-teal-200/60 p-1.5 transition-all focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-100/50">
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
                placeholder="How can I help you today?"
                className="flex-1 max-h-32 min-h-[44px] bg-transparent text-slate-800 px-3 py-2.5 text-sm outline-none resize-none placeholder-slate-400"
                rows={1}
              />
              {/* Mic Button */}
              <button
                onClick={() => setIsVoiceMode(true)}
                className="p-2.5 text-teal-600 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors shrink-0 mb-0.5"
                title="Voice input"
              >
                <Mic size={18} />
              </button>
              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 bg-teal-700 text-white rounded-xl hover:bg-teal-800 disabled:opacity-20 transition-all shadow-md shadow-teal-900/20 shrink-0 mb-0.5 mr-0.5"
              >
                <Send size={18} />
              </button>
            </div>
          )}
          
          <div className="mt-3 text-center">
            <p className="text-[10px] text-teal-600/40 tracking-wider font-medium uppercase">Vanth AI — Personalized Intelligence</p>
          </div>
        </div>
      </div>
    </>
  );
}
