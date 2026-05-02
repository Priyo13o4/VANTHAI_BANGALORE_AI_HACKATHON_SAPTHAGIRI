/**
 * src/hooks/useAIDispatcher.ts
 * Extracted from ERP-SIH AIChat.tsx handleSendMessage() dispatcher.
 *
 * CRITICAL: Keep existing ERP-SIH blocks EXACTLY as-is (navigate, fillForm).
 * New blocks are added AFTER the existing ones — never replacing them.
 *
 * sendToN8n() is DELETED. The only outbound communication is useWebSocket.sendMessage().
 * No reference to VITE_N8N_CHAT_URL anywhere.
 *
 * ── Migration: Shepherd.js + Driver.js → VanthAI Spotlight Engine ──
 * highlight action now uses useSpotlight instead of Driver.js
 * navigate+tour uses useSpotlight instead of Shepherd.js
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ActionEnvelope } from '../types/ws';
import { autoFillForm, highlightFilledFields } from '../utils/formHelpers';
import { useSpotlight } from './useSpotlight';

interface UseAIDispatcherOptions {
  app: 'cloudcare' | 'itr';
  allowedElements: Set<string>;
}

interface UseAIDispatcherReturn {
  dispatch: (envelope: ActionEnvelope) => void;
}

export function useAIDispatcher({
  app,
  allowedElements,
}: UseAIDispatcherOptions): UseAIDispatcherReturn {
  const navigate = useNavigate();
  const { startTour, highlight, clearHighlight } = useSpotlight(app);

  const dispatch = useCallback(
    (parsed: ActionEnvelope) => {
      // ── Existing ERP-SIH dispatcher blocks (keep exactly as-is) ──────────────

      // action: navigate (ERP-SIH original)
      if (parsed.action === 'navigate' && parsed.url) {
        setTimeout(() => navigate(parsed.url!), 500);
        return;
      }

      // action: fillForm (ERP-SIH original — fill_data maps to parsed.data)
      if (parsed.action === 'fillForm' && (parsed.fill_data ?? (parsed as any).data)) {
        const fillData = parsed.fill_data ?? (parsed as any).data;
        setTimeout(() => {
          autoFillForm(fillData);
          highlightFilledFields(Object.keys(fillData));
        }, 100);
        return;
      }

      // ── New blocks (added after ERP-SIH blocks, do NOT touch above) ──────────

      // action: highlight (VanthAI Spotlight — replaces Driver.js)
      else if (parsed.action === 'highlight' && parsed.element) {
        const selector = parsed.element;
        const normalizedId = selector.replace(/\[data-vanthai-id=['"]?([^'"\\]+)['"]?\]/i, '$1');
        if (allowedElements.has(normalizedId) || allowedElements.has(selector)) {
          highlight(
            selector,
            parsed.popover?.title,
            parsed.popover?.description,
          );
        }
        return;
      }

      // action: navigate+tour (navigate then launch Spotlight tour after 650ms)
      else if (parsed.action === 'navigate+tour' && parsed.url) {
        navigate(parsed.url);
        if (parsed.tour) {
          setTimeout(() => startTour(parsed.tour!), 650);
        }
        return;
      }

      // action: autofill (preferred name for fillForm; highlights filled fields)
      else if (parsed.action === 'autofill' && parsed.fill_data) {
        autoFillForm(parsed.fill_data);
        highlightFilledFields(Object.keys(parsed.fill_data));
        return;
      }

      // action: clearHighlight — dismiss any active spotlight
      else if (parsed.action === 'clearHighlight') {
        clearHighlight();
        return;
      }

      // action: none — no-op (message-only response)
    },
    [navigate, startTour, highlight, clearHighlight, allowedElements]
  );

  return { dispatch };
}
