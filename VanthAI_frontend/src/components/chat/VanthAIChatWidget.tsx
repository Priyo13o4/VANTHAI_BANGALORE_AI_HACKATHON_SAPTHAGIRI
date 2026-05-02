import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useChatApi } from '../../hooks/useChatApi';
import { useAIDispatcher } from '../../hooks/useAIDispatcher';
import { CLOUDCARE_ALLOWED } from '../../apps/cloudcare/tours/index';
import { ITR_ALLOWED } from '../../apps/itr/tours/index';
import { WS_ENDPOINTS } from '../../config/ws';
import type { ActionEnvelope, WSEnvelope } from '../../types/ws';
import { Bot, X, Mic, Send, RotateCcw, BrainCircuit, ChevronDown, ChevronUp, Keyboard } from 'lucide-react';

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

  const { sendMessage, connectionState } = useChatApi({ url: wsUrl, onMessage: handleEnvelope });

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

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        data-vanthai-id="vanthai-chat-toggle"
        onClick={() => setOpen((p) => !p)}
        className={clsx(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center text-white transition-all duration-500 ease-in-out hover:scale-105',
          open ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-tr from-blue-600 to-indigo-500'
        )}
        title="Vanth AI Assistant"
      >
        {open ? <X size={24} /> : <Bot size={28} className="animate-pulse" />}
      </button>

      {/* Main Chat Panel - Sleek Dark Glassmorphism */}
      <div
        data-vanthai-id="vanthai-chat-panel"
        className={clsx(
          'fixed bottom-24 right-6 z-50 w-[400px] h-[650px] max-h-[80vh] flex flex-col overflow-hidden transition-all duration-500 ease-in-out origin-bottom-right rounded-3xl',
          'bg-slate-900/85 backdrop-blur-2xl border border-slate-700/50 shadow-[0_0_40px_rgba(0,0,0,0.5)]',
          open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                <Bot size={20} />
              </div>
              {connectionState === 'connected' && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
              )}
            </div>
            <div>
              <div className="text-white font-semibold tracking-wide">Vanth AI</div>
              <div className={clsx('text-xs font-medium', connectionState === 'connected' ? 'text-green-400' : 'text-slate-400')}>
                {connectionState === 'connected' ? 'Online' : connectionState === 'connecting' ? 'Connecting...' : 'Offline'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors"
              title="New Chat"
            >
              <RotateCcw size={18} />
            </button>
            <button
              data-vanthai-id="vanthai-voice-toggle"
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={clsx(
                'p-2 rounded-full transition-all duration-300 shadow-inner',
                isVoiceMode ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
              title={isVoiceMode ? 'Switch to Text' : 'Switch to Voice'}
            >
              {isVoiceMode ? <Keyboard size={18} /> : <Mic size={18} />}
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={clsx(
                'max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-md relative',
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm'
                  : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-2xl rounded-tl-sm'
              )}>
                
                {/* AI Content */}
                <div className="break-words">
                  {msg.content}
                  {msg.isStreaming && <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse" />}
                </div>

                {/* Show Thinking Dropdown for AI Messages */}
                {msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-700/50">
                    <button
                      onClick={() => toggleThinkingBox(msg.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      <BrainCircuit size={14} />
                      {expandedThinking[msg.id] ? 'Hide thought process' : 'Show thought process'}
                      {expandedThinking[msg.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    
                    {expandedThinking[msg.id] && (
                      <div className="mt-2 space-y-1.5 bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/30">
                        {msg.toolCalls.map((tc, i) => {
                          const isSuccess = tc.includes('(success)');
                          const isError = tc.includes('(error)');
                          const isRunning = !isSuccess && !isError;
                          
                          return (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <span className={clsx(
                                "mt-0.5 w-1.5 h-1.5 rounded-full shrink-0",
                                isSuccess ? "bg-green-400" : isError ? "bg-red-400" : "bg-indigo-400 animate-pulse"
                              )}></span>
                              <span className="text-slate-300 font-mono tracking-tight">{tc.replace(' (success)', '').replace(' (error)', '')}</span>
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
          
          {/* Active Thinking State */}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-slate-400 font-medium">Vanth AI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-1" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-700/50 backdrop-blur-md">
          {isVoiceMode ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                <button 
                  className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-transform hover:scale-105 active:scale-95"
                >
                  <Mic size={28} />
                </button>
              </div>
              <p className="mt-4 text-sm text-indigo-300 font-medium animate-pulse">Listening...</p>
            </div>
          ) : (
            <div className="relative flex items-end gap-2 bg-slate-900/50 rounded-2xl border border-slate-700/50 p-1.5 transition-all focus-within:border-indigo-500/50 focus-within:bg-slate-900 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)]">
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
                placeholder="Ask Vanth AI anything..."
                disabled={connectionState !== 'connected'}
                className="flex-1 max-h-32 min-h-[44px] bg-transparent text-slate-200 px-3 py-2.5 text-sm outline-none resize-none placeholder-slate-500 disabled:opacity-50"
                rows={1}
              />
              <button
                data-vanthai-id="vanthai-chat-send"
                onClick={handleSend}
                disabled={!input.trim() || connectionState !== 'connected'}
                className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-colors shrink-0 mb-0.5 mr-0.5"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
          )}
          
          <div className="mt-3 text-center">
            <p className="text-[10px] text-slate-500">Vanth AI can make mistakes. Verify important information.</p>
          </div>
        </div>
      </div>
    </>
  );
}
