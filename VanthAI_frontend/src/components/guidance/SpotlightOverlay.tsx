/**
 * src/components/guidance/SpotlightOverlay.tsx
 * Premium AI-guided spotlight overlay.
 *
 * Uses the box-shadow technique: a transparent element positioned at the
 * target with a massive box-shadow that covers the entire viewport.
 * The target content shows through crystal clear — no blur, no clip-path issues.
 *
 * Features:
 *   - Frosted overlay via box-shadow (no clip-path, no backdrop-filter holes)
 *   - Teal glow ring + ripple animations on target
 *   - Floating info text (no box/outline) with step dots
 *   - ESC / click-overlay to dismiss
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  getSpotlightState,
  subscribeSpotlight,
  nextStep,
  prevStep,
  endSpotlight,
} from './spotlightStore';
import './spotlight.css';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const PAD = 14;
const INFO_GAP = 28;

export default function SpotlightOverlay() {
  const state = useSyncExternalStore(subscribeSpotlight, getSpotlightState);
  const [rect, setRect] = useState<Rect | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevStepRef = useRef(-1);
  const animFrameRef = useRef(0);

  const step = state.active ? state.steps[state.currentStep] : null;
  const isSingle = !!state.singleHighlight;

  // ── Measure target element ──────────────────────────────────────────────────
  const measure = useCallback(() => {
    if (!step) { setRect(null); return; }
    const el = document.querySelector(step.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      animFrameRef.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setRect({
          x: r.left - PAD,
          y: r.top - PAD,
          w: r.width + PAD * 2,
          h: r.height + PAD * 2,
        });
      });
    } else {
      setRect({
        x: window.innerWidth / 2 - 160,
        y: window.innerHeight / 2 - 40,
        w: 320,
        h: 80,
      });
    }
  }, [step]);

  // Re-measure on step change, resize, scroll
  useEffect(() => {
    if (!state.active) { setRect(null); setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(measure, 60);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [state.active, state.currentStep, measure]);

  // Trigger ripple on step change
  useEffect(() => {
    if (state.active && state.currentStep !== prevStepRef.current) {
      prevStepRef.current = state.currentStep;
      setRippleKey((k) => k + 1);
    }
  }, [state.active, state.currentStep]);

  // ESC key dismisses
  useEffect(() => {
    if (!state.active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endSpotlight();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.active]);

  // ── Render nothing if inactive ──────────────────────────────────────────────
  if (!visible || !rect) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Clamp rect to viewport
  const cx = Math.max(0, rect.x);
  const cy = Math.max(0, rect.y);
  const cw = Math.min(rect.w, vw - cx);
  const ch = Math.min(rect.h, vh - cy);

  // Info positioning: prefer below, flip above if near bottom
  const infoCenterX = cx + cw / 2;
  const flipAbove = cy + ch + INFO_GAP + 160 > vh;
  const infoTop = flipAbove ? cy - INFO_GAP : cy + ch + INFO_GAP;
  const infoLeft = Math.max(40, Math.min(infoCenterX, vw - 40));

  // Connector line
  const connHeight = Math.abs(INFO_GAP - 4);

  const isFirst = state.currentStep === 0;
  const isLast = state.currentStep === state.steps.length - 1;

  return (
    <>
      {/* ── Click-catcher: full-screen invisible div to dismiss on overlay click ── */}
      <div
        className="spotlight-click-catcher"
        onMouseDown={() => endSpotlight()}
      />

      {/* ── Cutout element with massive box-shadow = the overlay ── */}
      {/* The element itself is transparent → target shows through clearly */}
      {/* The box-shadow covers the entire viewport with the frosted color */}
      <div
        className="spotlight-cutout"
        style={{
          left: cx,
          top: cy,
          width: cw,
          height: ch,
        }}
      />

      {/* ── Glow ring ── */}
      <div
        className="spotlight-glow"
        style={{ left: cx, top: cy, width: cw, height: ch }}
      />

      {/* ── Ripple rings (re-mount on step change via key) ── */}
      <div key={`ripple-${rippleKey}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="spotlight-ripple-ring"
            style={{ left: cx, top: cy, width: cw, height: ch }}
          />
        ))}
      </div>

      {/* ── Connector line ── */}
      {step?.title && (
        <div
          className="spotlight-connector"
          data-position={flipAbove ? 'above' : 'below'}
          style={{
            left: infoCenterX,
            top: flipAbove ? infoTop + 40 : cy + ch + 2,
            height: connHeight,
            transformOrigin: flipAbove ? 'bottom center' : 'top center',
          }}
        />
      )}

      {/* ── Floating info (no box) ── */}
      {step && (step.title || step.text) && (
        <div
          className="spotlight-info"
          data-position={flipAbove ? 'above' : 'below'}
          style={{ left: infoLeft, top: infoTop }}
        >
          <div className="spotlight-info-glow" />

          {step.title && <div className="spotlight-info-title">{step.title}</div>}
          {step.text && <div className="spotlight-info-text">{step.text}</div>}

          {/* Step dots (only for multi-step tours) */}
          {!isSingle && state.steps.length > 1 && (
            <div className="spotlight-dots">
              {state.steps.map((_, i) => (
                <div
                  key={i}
                  className="spotlight-dot"
                  data-active={i === state.currentStep ? 'true' : undefined}
                  data-completed={i < state.currentStep ? 'true' : undefined}
                />
              ))}
            </div>
          )}

          {/* Nav buttons */}
          <div className="spotlight-nav">
            {!isFirst && !isSingle && (
              <button className="spotlight-btn spotlight-btn-secondary" onClick={prevStep}>
                ← Back
              </button>
            )}
            {isSingle ? (
              <button className="spotlight-btn spotlight-btn-primary" onClick={endSpotlight}>
                Got it
              </button>
            ) : isLast ? (
              <button className="spotlight-btn spotlight-btn-done" onClick={endSpotlight}>
                Done ✓
              </button>
            ) : (
              <button className="spotlight-btn spotlight-btn-primary" onClick={nextStep}>
                Next →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── ESC hint ── */}
      <div className="spotlight-dismiss-hint">
        Press <kbd>ESC</kbd> to dismiss
      </div>
    </>
  );
}
