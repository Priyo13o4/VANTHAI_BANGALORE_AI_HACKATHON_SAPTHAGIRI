/**
 * useVoiceStreamer.ts
 * Phase 4c — Duplex audio hook for Gemini Live voice sessions.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

export type VoiceConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';

export interface VoiceTranscript {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface VoiceAction {
  action: string;
  url?: string;
  message?: string;
}

interface UseVoiceStreamerOptions {
  url: string;
  onTranscript: (t: VoiceTranscript) => void;
  onAction: (a: VoiceAction) => void;
  onToolCall: (name: string, status: string) => void;
  onTurnComplete: () => void;
  onError: (msg: string) => void;
}

// ── PCM helpers ──────────────────────────────────────────────────────────────

function downsample(buffer: Float32Array, srcRate: number, dstRate: number): Float32Array {
  if (srcRate === dstRate) return buffer;
  const ratio = srcRate / dstRate;
  const length = Math.floor(buffer.length / ratio);
  const result = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = buffer[Math.floor(i * ratio)];
  }
  return result;
}

function float32ToInt16(buffer: Float32Array): ArrayBuffer {
  const out = new Int16Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out.buffer;
}

function int16ToFloat32(buffer: ArrayBuffer): Float32Array {
  const i16 = new Int16Array(buffer);
  const f32 = new Float32Array(i16.length);
  for (let i = 0; i < i16.length; i++) {
    f32[i] = i16[i] / 32768.0;
  }
  return f32;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useVoiceStreamer({
  url,
  onTranscript,
  onAction,
  onToolCall,
  onTurnComplete,
  onError,
}: UseVoiceStreamerOptions) {
  const [connectionState, setConnectionState] = useState<VoiceConnectionState>('idle');
  const [isStreaming, setIsStreaming] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const _location = useLocation();

  const enqueueAudio = useCallback((pcmBytes: ArrayBuffer) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const f32 = int16ToFloat32(pcmBytes);
    const sampleRate = 24000;
    const audioBuffer = ctx.createBuffer(1, f32.length, sampleRate);
    audioBuffer.copyToChannel(f32, 0);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    const now = ctx.currentTime;
    const startAt = Math.max(now, nextPlayTimeRef.current);
    source.start(startAt);
    nextPlayTimeRef.current = startAt + audioBuffer.duration;
  }, []);

  const stopStreaming = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.onaudioprocess = null;
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => null);
      audioCtxRef.current = null;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'user_stopped');
      }
      wsRef.current = null;
    }
    nextPlayTimeRef.current = 0;
    setIsStreaming(false);
    setConnectionState('idle');
  }, []);

  const startStreaming = useCallback(async () => {
    if (isStreaming) return;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (err) {
      onError('Microphone access denied.');
      return;
    }
    streamRef.current = stream;

    const ctx = new AudioContext({ sampleRate: 48000 });
    audioCtxRef.current = ctx;
    nextPlayTimeRef.current = ctx.currentTime;

    setConnectionState('connecting');
    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    // Heartbeat setup
    let heartbeat: any = null;

    ws.onopen = () => {
      setConnectionState('connected');
      setIsStreaming(true);

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const f32_48k = e.inputBuffer.getChannelData(0);
        const f32_16k = downsample(f32_48k, 48000, 16000);
        const pcm16 = float32ToInt16(f32_16k);
        ws.send(pcm16);
      };

      source.connect(processor);
      processor.connect(ctx.destination);

      heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 5000);
    };

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        enqueueAudio(event.data);
        return;
      }
      try {
        const msg = JSON.parse(event.data as string);
        switch (msg.type) {
          case 'transcript':
            onTranscript({ id: crypto.randomUUID(), role: msg.role, text: msg.text });
            break;
          case 'action':
            onAction({ action: msg.action, url: msg.url, message: msg.message });
            break;
          case 'tool_call':
            onToolCall(msg.name, msg.status);
            break;
          case 'turn_complete':
            onTurnComplete();
            break;
          case 'error':
            onError(msg.message ?? 'Voice error');
            break;
          case 'done':
            stopStreaming();
            break;
        }
      } catch (e) {}
    };

    ws.onerror = () => {
      setConnectionState('error');
      onError('Voice WebSocket error.');
      stopStreaming();
    };

    ws.onclose = (e) => {
      if (heartbeat) clearInterval(heartbeat);
      if (e.code !== 1000) {
        setConnectionState('disconnected');
        onError(`Voice connection closed: ${e.reason || 'unknown reason'}`);
      }
      stopStreaming();
    };
  }, [isStreaming, url, enqueueAudio, onTranscript, onAction, onToolCall, onTurnComplete, onError, stopStreaming]);

  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    startStreaming,
    stopStreaming,
    isStreaming,
    connectionState,
  };
}
