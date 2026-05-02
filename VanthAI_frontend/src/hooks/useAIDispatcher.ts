/**
 * src/hooks/useAIDispatcher.ts
 * Extracted from ERP-SIH AIChat.tsx handleSendMessage() dispatcher.
 *
 * CRITICAL: Keep existing ERP-SIH blocks EXACTLY as-is (navigate, fillForm).
 * New blocks are added AFTER the existing ones — never replacing them.
 *
 * sendToN8n() is DELETED. The only outbound communication is useWebSocket.sendMessage().
 * No reference to VITE_N8N_CHAT_URL anywhere.
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ActionEnvelope } from '../types/ws';
import { autoFillForm, highlightFilledFields } from '../utils/formHelpers';
import { applyPageBlur, clearPageBlur } from '../utils/blur';
import { useTour } from './useTour';

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
  const { startTour } = useTour(app);

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

      // action: highlight (Driver.js blur + spotlight)
      else if (parsed.action === 'highlight' && parsed.element) {
        // data-vanthai-id convention: only registered elements can be highlighted
        const selector = parsed.element;
        const normalizedId = selector.replace(/\[data-vanthai-id=['"]?([^'"\\]]+)['"]?\]/i, '$1');
        if (allowedElements.has(normalizedId) || allowedElements.has(selector)) {
          applyPageBlur();
          // Lazy-import driver.js to avoid loading it at startup
          import('driver.js').then(({ driver }) => {
            const driverObj = driver({
              animate: true,
              overlayOpacity: 0.75,
              onDestroyStarted: () => {
                clearPageBlur();
                driverObj.destroy();
              },
            });
            driverObj.highlight({
              element: selector,
              popover: parsed.popover
                ? { title: parsed.popover.title, description: parsed.popover.description }
                : undefined,
            });
          });
        }
        return;
      }

      // action: navigate+tour (navigate then launch Shepherd tour after 650ms)
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

      // action: none — no-op (message-only response)
    },
    [navigate, startTour, allowedElements]
  );

  return { dispatch };
}
