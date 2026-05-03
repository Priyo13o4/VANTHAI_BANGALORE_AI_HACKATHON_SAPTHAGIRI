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
  onPrefill?: (data: { doctorId?: string; department?: string; hospitalId?: string; date?: string; time?: string }) => void;
}

interface UseAIDispatcherReturn {
  dispatch: (envelope: ActionEnvelope) => void;
}

export function useAIDispatcher({
  app,
  allowedElements,
  onPrefill,
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

      // action: autofill (preferred name for fillForm; highlights filled fields)
      else if (parsed.action === 'autofill' && parsed.fill_data) {
        const applyFill = () => {
          autoFillForm(parsed.fill_data!);
          highlightFilledFields(Object.keys(parsed.fill_data!));
        };

        // If a target URL is provided and we are not on that route, navigate first then retry-fill.
        if (parsed.url && window.location.pathname !== parsed.url) {
          setTimeout(() => navigate(parsed.url!), 200);

          let attempts = 0;
          const maxAttempts = 18;
          const retryTimer = window.setInterval(() => {
            attempts += 1;
            const keys = Object.keys(parsed.fill_data || {});
            const hasTargetInput = keys.some((key) => !!document.querySelector(`[name="${key}"]`));
            if (window.location.pathname === parsed.url && hasTargetInput) {
              window.clearInterval(retryTimer);
              applyFill();
            } else if (attempts >= maxAttempts) {
              window.clearInterval(retryTimer);
              applyFill();
            }
          }, 200);
          return;
        }

        applyFill();
        return;
      }

      // action: highlight — also dispatch custom event for Form 18
      else if ((parsed.action === 'highlight' || parsed.action === 'spotlight') && (parsed.selector || parsed.element)) {
        // Use selector if provided, otherwise construct from element ID
        const selector = parsed.selector || `[data-vanthai-id="${parsed.element}"]`;
        const normalizedId = parsed.element || selector.replace(/\[data-vanthai-id=['"]?([^'"\\]+)['"]?\]/i, '$1');
        const isItrForm18Selector = app === 'itr' && (
          selector.startsWith('[name="') ||
          selector.includes('[data-vanthai-id="') ||
          normalizedId.endsWith('-root')
        );

        if (allowedElements.has(normalizedId) || allowedElements.has(selector) || isItrForm18Selector) {
          highlight(
            selector,
            parsed.popover?.title,
            parsed.popover?.description,
          );
        }
        
        // Dispatch custom event for Form 18 pages
        if (parsed.element) {
          const event = new CustomEvent('form18-action', {
            detail: {
              action: 'highlight',
              element: parsed.element,
              selector,
              popover: parsed.popover
            }
          });
          window.dispatchEvent(event);
        }
        return;
      }

      // action: clearHighlight — dismiss any active spotlight
      else if (parsed.action === 'clearHighlight') {
        clearHighlight();
        return;
      }

      // action: prefill_form (CloudCare appointment form pre-fill)
      else if (parsed.action === 'prefill_form' && onPrefill) {
        onPrefill({
          doctorId: (parsed as any).doctorId,
          department: (parsed as any).department,
          hospitalId: (parsed as any).hospitalId,
          date: (parsed as any).date,
          time: (parsed as any).time,
        });
        return;
      }

      // action: none — no-op (message-only response)
    },
    [navigate, startTour, highlight, clearHighlight, allowedElements, onPrefill]
  );

  return { dispatch };
}
