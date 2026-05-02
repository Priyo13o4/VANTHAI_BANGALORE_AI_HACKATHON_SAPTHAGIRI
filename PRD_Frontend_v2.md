# PRD — VanthAI: Frontend (v2.0)

**Stack:** React 19 · TypeScript · Vite 6 · Tailwind CSS v4 · Driver.js · Shepherd.js  
**Scope:** Extend ERP-SIH frontend for CloudCare + ITR Portal with shared AI chat infrastructure  
**Base:** ERP-SIH `AIChat.tsx`, `formHelpers.ts`, `router.tsx` — extended in place

---

## 1. Objectives

Port and extend the ERP-SIH frontend to:

- Host CloudCare (existing UI) and ITR Portal under one Vite project
- Replace n8n webhook calls in `AIChat.tsx` with WebSocket connections to FastAPI
- Extract shared dispatcher logic into `useAIDispatcher.ts` hook (reused by chat + voice)
- Add visual guidance layer: blur+spotlight (Driver.js) and multi-step tours (Shepherd.js)
- Stream agent responses: thinking block, tool call indicators, token-by-token text, action dispatch
- All WebSocket paths driven by `.env` — no hardcoded strings

---

## 2. Package Versions (Pinned)

```json
{
  "dependencies": {
    "react": "19.2.5",
    "react-dom": "19.2.5",
    "react-router-dom": "7.6.0",
    "typescript": "5.8.3",

    "driver.js": "1.4.0",
    "shepherd.js": "15.2.2",

    "mermaid": "11.13.0",

    "zustand": "5.0.3",
    "clsx": "2.1.1",
    "lucide-react": "0.511.0"
  },
  "devDependencies": {
    "vite": "6.3.4",
    "@vitejs/plugin-react": "4.4.1",
    "tailwindcss": "4.1.5",
    "@tailwindcss/vite": "4.1.5"
  }
}
```

> **Tailwind v4:** Use `@tailwindcss/vite` plugin — no `tailwind.config.js` file. Configure via `@theme` in CSS.  
> **Shepherd.js:** Use vanilla `shepherd.js` directly. The `react-shepherd` wrapper has documented React 19 issues — wrap in `useTour.ts` hook instead.

---

## 3. What to Keep from ERP-SIH (Port Directly)

| ERP-SIH File | Action | Notes |
|---|---|---|
| `components/ai/AIChat.tsx` | Port + extend | Replace `sendToN8n()` with `useWebSocket`. Keep `ROUTE_ALIASES`, `handleSendMessage()` dispatcher shape, `navigate()` calls |
| `utils/formHelpers.ts` | Port as-is | `autoFillForm()`, `nativeInputValueSetter` trick, `highlightFilledFields()`, `detectPageType()` — zero changes |
| `router.tsx` | Port + extend | Keep existing route structure. Add CloudCare and ITR route trees |
| `components/auth/ProtectedRoute.tsx` | Port as-is | |
| `components/layout/Layout.tsx` | Port + extend | Add `<ChatWidget>` mounting point |
| `components/layout/Sidebar.tsx` | Port + extend | Add CloudCare + ITR nav sections |
| `components/layout/Header.tsx` | Port as-is | |
| `components/ui/Button.tsx` | Port as-is | |
| `components/ui/Input.tsx` | Port as-is | |
| `components/ui/Card.tsx` | Port as-is | |
| `stores/authStore.ts` | Port as-is | |
| `stores/uiStore.ts` | Port as-is | |
| `types/auth.ts` | Port as-is | |
| `types/api.ts` | Port + extend | Add WS envelope types |
| `config/api.ts` | Port + extend | Add WS endpoint config |
| `hooks/useApi.ts` | Port as-is | |

---

## 4. Environment Config

```typescript
// src/config/ws.ts  ← only file that reads WS env vars
export const WS_ENDPOINTS = {
  cloudcare: {
    chat:  import.meta.env.VITE_WS_CLOUDCARE_CHAT  as string,
    voice: import.meta.env.VITE_WS_CLOUDCARE_VOICE as string,
  },
  itr: {
    chat:  import.meta.env.VITE_WS_ITR_CHAT  as string,
    voice: import.meta.env.VITE_WS_ITR_VOICE as string,
  },
} as const;
```

No WS URL appears anywhere else in the codebase.

---

## 5. Project Structure

```
frontend/
├── vite.config.ts
├── package.json
│
└── src/
    ├── config/
    │   ├── api.ts              ← (from ERP-SIH) + WS import
    │   └── ws.ts               ← NEW: WS endpoint config
    │
    ├── hooks/                  ← shared, app-agnostic
    │   ├── useApi.ts           ← (from ERP-SIH, as-is)
    │   ├── useWebSocket.ts     ← NEW: WS lifecycle hook
    │   ├── useAIDispatcher.ts  ← NEW: extracted from AIChat.tsx handleSendMessage()
    │   ├── useVoiceAgent.ts    ← NEW: mic input + audio stream + waveform state
    │   └── useTour.ts          ← NEW: vanilla Shepherd.js wrapper
    │
    ├── stores/
    │   ├── authStore.ts        ← (from ERP-SIH, as-is)
    │   └── uiStore.ts          ← (from ERP-SIH, as-is)
    │
    ├── types/
    │   ├── auth.ts             ← (from ERP-SIH, as-is)
    │   ├── api.ts              ← (from ERP-SIH) + ActionPayload, WSEnvelope types
    │   └── ws.ts               ← NEW: all WS envelope type definitions
    │
    ├── utils/
    │   ├── formHelpers.ts      ← (from ERP-SIH) + CloudCare + ITR form descriptors
    │   └── blur.ts             ← NEW: applyPageBlur() / clearPageBlur()
    │
    ├── components/
    │   ├── auth/
    │   │   └── ProtectedRoute.tsx      ← (from ERP-SIH, as-is)
    │   ├── layout/
    │   │   ├── Layout.tsx              ← (from ERP-SIH) + ChatWidget mount
    │   │   ├── Sidebar.tsx             ← (from ERP-SIH) + CloudCare/ITR nav
    │   │   └── Header.tsx              ← (from ERP-SIH, as-is)
    │   ├── ui/
    │   │   ├── Button.tsx              ← (from ERP-SIH, as-is)
    │   │   ├── Input.tsx               ← (from ERP-SIH, as-is)
    │   │   └── Card.tsx                ← (from ERP-SIH, as-is)
    │   └── chat/                       ← ALL NEW
    │       ├── ChatWidget.tsx          ← container: text mode or voice mode
    │       ├── ChatBubble.tsx          ← renders single message (all message_types)
    │       ├── ThinkingBlock.tsx       ← collapsible thinking + tool call stream
    │       ├── ToolCallIndicator.tsx   ← "🔧 load_page_markdown — reading..." + expand
    │       ├── QuickReply.tsx          ← large tap-target option buttons
    │       ├── StepFlow.tsx            ← in-chat wizard stepper
    │       ├── MermaidRenderer.tsx     ← renders mermaid code → SVG
    │       └── VoiceOrb.tsx            ← animated orb + waveform visualizer
    │
    ├── apps/
    │   ├── cloudcare/
    │   │   ├── patient/        ← existing CloudCare patient pages
    │   │   ├── doctor/         ← existing CloudCare doctor pages
    │   │   └── tours/          ← Shepherd tour configs
    │   │       ├── book-appointment.ts
    │   │       ├── view-records.ts
    │   │       └── index.ts    ← tour registry + ALLOWED_ELEMENTS set
    │   └── itr/
    │       ├── pages/
    │       │   ├── ITROverview.tsx
    │       │   ├── PersonalInfo.tsx
    │       │   ├── SalaryIncome.tsx
    │       │   ├── Deductions.tsx
    │       │   └── TaxPaid.tsx
    │       └── tours/
    │           ├── fill-salary.ts
    │           ├── find-form16a.ts
    │           └── index.ts    ← tour registry + ALLOWED_ELEMENTS set
    │
    └── router.tsx              ← (from ERP-SIH) + CloudCare + ITR route trees
```

---

## 6. Key Changes to ERP-SIH Files

### `AIChat.tsx` → Extended

The existing `handleSendMessage()` dispatcher shape is kept exactly. Changes:

1. **Replace `sendToN8n()`** with `useWebSocket` hook — message is sent over WS, responses stream in via `messageStream`
2. **Add new `else if` blocks** to existing dispatcher for new action types:
   ```typescript
   // Existing blocks (keep exactly as-is from ERP-SIH):
   if (parsed.action === 'navigate' && parsed.url) { ... navigate(parsed.url) }
   if (parsed.action === 'fillForm' && parsed.data) { ... autoFillForm(parsed.data) }

   // New blocks (add after existing):
   else if (parsed.action === 'highlight' && parsed.element) {
     if (ALLOWED_ELEMENTS.has(parsed.element)) {
       applyPageBlur();
       driverInstance.highlight({ element: parsed.element, popover: parsed.popover });
     }
   }
   else if (parsed.action === 'navigate+tour' && parsed.url) {
     navigate(parsed.url);
     if (parsed.tour) setTimeout(() => startTour(parsed.tour!), 650);
   }
   else if (parsed.action === 'autofill' && parsed.fill_data) {
     autoFillForm(parsed.fill_data);
     highlightFilledFields(Object.keys(parsed.fill_data));
   }
   ```
3. **Extract dispatcher to `useAIDispatcher.ts`** hook so voice widget (`VoiceOrb`) can share the same logic
4. **Session ID:** Remove `localStorage.getItem('ai_chat_session_id')` pattern entirely — session ID now arrives from server as first WS frame `{ type: "session_init" }`. Never stored in `localStorage`

### `formHelpers.ts` → Extended

Port 100% as-is. Add two new sections at the bottom:

```typescript
// CloudCare form descriptors (add to FORM_DESCRIPTIONS)
cloudcare_appointment: `...`,
cloudcare_prescription_view: `...`,

// ITR form descriptors
itr_personal: `ITR-1 Personal Information: PAN (required), Full Name, Date of Birth, Mobile...`,
itr_salary: `ITR-1 Salary Income: Gross Salary, HRA received, Standard Deduction...`,
itr_deductions: `ITR-1 Deductions: 80C investments, 80D health insurance, Form 16A reference...`,
```

Add new `detectPageType()` cases:
```typescript
if (path.includes('/itr/personal'))   return 'itr_personal';
if (path.includes('/itr/salary'))     return 'itr_salary';
if (path.includes('/itr/deductions')) return 'itr_deductions';
if (path.includes('/cloudcare/patient/appointments')) return 'cloudcare_appointment';
```

### `router.tsx` → Extended

Keep all existing ERP-SIH routes. Add new app route trees:
```typescript
{ path: '/cloudcare/*', element: <CloudCareApp /> },   // existing pages
{ path: '/itr/*',       element: <ITRApp /> },          // new ITR pages
{ path: '/',            element: <Navigate to="/cloudcare" replace /> },
```

---

## 7. `useWebSocket.ts` — Replaces `sendToN8n()`

Manages WS lifecycle with these key behaviours:

- **On mount:** Opens WS to the endpoint passed as prop from `config/ws.ts`. Waits for `{ type: "session_init" }` as first frame — this is the session ID
- **Session ID:** Received from server, held in component state only — never written to `localStorage` or `sessionStorage`
- **On unmount / `beforeunload`:** Closes WS → triggers backend `DEL session:{id}` 
- **No reconnection on close:** Page reload = new WS = new session. Intentional.
- Returns: `{ sendMessage, connectionState, messageStream, sessionId }`

---

## 8. `useAIDispatcher.ts` — Extracted from `handleSendMessage()`

Single hook imported by both `ChatWidget` and `VoiceOrb`. Contains the full dispatcher logic:

```typescript
export function useAIDispatcher(app: 'cloudcare' | 'itr') {
  const navigate = useNavigate();
  const { startTour } = useTour(app);
  const ALLOWED_ELEMENTS = app === 'cloudcare' ? CLOUDCARE_ALLOWED : ITR_ALLOWED;

  function dispatch(envelope: ActionEnvelope) {
    // All action types handled here — both existing ERP-SIH ones and new ones
  }

  return { dispatch };
}
```

`CLOUDCARE_ALLOWED` and `ITR_ALLOWED` are `Set<string>` exported from each app's `tours/index.ts`.

---

## 9. Chat UI Streaming Behaviour

Each WS envelope type renders differently as it arrives:

| Envelope `type` | Rendered as |
|----------------|-------------|
| `session_init` | Silent — stores `session_id` in state |
| `thinking` | Appended to `ThinkingBlock` — auto-expands, shows raw reasoning tokens |
| `tool_call` (running) | `ToolCallIndicator` with spinner: `🔧 load_page_markdown — reading...` |
| `tool_call` (done) | Indicator → checkmark: `✓ load_page_markdown` — expandable to show `result_preview` |
| `token` | Streamed character-by-character into current `ChatBubble` |
| `action` (quick_reply) | `QuickReply` card with large tap buttons |
| `action` (mermaid) | `MermaidRenderer` renders diagram inline in chat bubble |
| `action` (step_flow) | `StepFlow` wizard stepper renders inside chat |
| `done` | Typing indicator dismissed. `ThinkingBlock` collapses |
| `error` | Error bubble with message text |

### `ThinkingBlock.tsx`

Collapsible, auto-opens on first `thinking` token. Collapses when `done` received.

```
┌─ 💭 Thinking... ─────────────────────────── [▲ collapse] ┐
│  The user wants health records. I should call              │
│  load_page_markdown to understand the page first...        │
│                                                            │
│  🔧 load_page_markdown("/cloudcare/patient/records")       │
│     [running spinner]                                      │
│  ✓ load_page_markdown  [▼ expand result]                   │
└────────────────────────────────────────────────────────────┘
```

---

## 10. Visual Guidance

### Blur + Spotlight (Driver.js)

When `action: highlight` arrives:
1. `applyPageBlur()` adds `active` class to `#page-blur-overlay` — CSS blurs all page content
2. `driver().highlight({ element, popover })` renders element above blur
3. `clearPageBlur()` called on popover dismiss or next user message

```css
/* Only in global.css — no inline styles */
#page-blur-overlay.active ~ #root {
  filter: blur(3px) brightness(0.6);
  pointer-events: none;
  transition: filter 250ms ease;
}
```

Chat widget excluded from blur (fixed position, separate stacking context).

### Shepherd.js Tours (`useTour.ts`)

Tour configs in `apps/{app}/tours/*.ts`. Vanilla Shepherd, no React wrapper:

```typescript
// apps/cloudcare/tours/book-appointment.ts
export const bookAppointmentTour = [
  {
    attachTo: { element: '[data-chatbot-id="cloudcare-appointment-date"]', on: 'bottom' },
    title: 'Step 1 of 3 — Pick a date',
    text: 'Tap the calendar to choose your appointment date.',
    buttons: [{ text: 'Next →', action: 'next' }],
  },
  // ... more steps
];
```

All registered in `tours/index.ts` as `Record<string, StepConfig[]>`.

---

## 11. `data-vanthai-id` Convention

Format: `{app}-{page}-{element}`. All selectors registered in `tours/index.ts` as `ALLOWED_ELEMENTS`.

| App | Example IDs |
|-----|-------------|
| CloudCare | `cloudcare-records-latest`, `cloudcare-appointments-confirm-btn`, `cloudcare-vitals-alert-badge` |
| ITR | `itr-salary-gross-input`, `itr-deductions-80c-field`, `itr-deductions-form16a-field`, `itr-taxpaid-submit-btn` |

Elements without a registered `data-vanthai-id` cannot be highlighted — dispatcher silently ignores them.

---

## 12. Voice Agent — `VoiceOrb.tsx`

```
Mic → getUserMedia() → MediaRecorder → binary WS frames to backend
                                              ↓
                              { type: "token" }     → transcript text streams into orb
                              { type: "action" }    → useAIDispatcher.dispatch()
                              { type: "thinking" }  → compact pill above orb
                                              ↓
AudioContext + AnalyserNode → 20-bar equalizer waveform (mic amplitude)
TTS audio chunks → AudioBufferSourceNode → plays sequentially
```

Visual states:
- **Idle:** slow pulse, grey
- **Listening:** fast pulse, blue + waveform bars reacting to mic amplitude  
- **Thinking:** orange pulse + ThinkingBlock pill
- **Speaking:** green wave animation + transcript appearing below orb

> ⚠️ **Pre-build test:** Confirm Gemma E4B in LM Studio supports audio I/O. If text-only, voice pipeline becomes: mic → Whisper STT → Gemma text → TTS separately. Voice orb UI is the same either way.

---

## 13. ITR Portal Pages

Five pages mirroring ITR-1 Sahaj. All inputs are real HTML — pre-populated from session where available.

| Page | Route | Key `data-chatbot-id` |
|------|-------|-----------------------|
| Overview | `/itr` | `itr-overview-start-btn` |
| Personal Info | `/itr/personal` | `itr-personal-pan`, `itr-personal-name`, `itr-personal-dob` |
| Salary Income | `/itr/salary` | `itr-salary-gross`, `itr-salary-hra`, `itr-salary-standard-deduction` |
| Deductions | `/itr/deductions` | `itr-deductions-80c`, `itr-deductions-80d`, `itr-deductions-form16a-field` |
| Tax Paid | `/itr/tax-paid` | `itr-taxpaid-tds-employer`, `itr-taxpaid-submit-btn` |

---

## 14. Acceptance Criteria

- [ ] All ERP-SIH files ported — existing navigation and autofill behaviour unchanged
- [ ] `sendToN8n()` fully replaced by `useWebSocket` — no HTTP calls in chat flow
- [ ] `session_id` from `session_init` frame — never read from or written to `localStorage`
- [ ] Page reload creates new session — no state carryover
- [ ] `ThinkingBlock` streams and collapses correctly
- [ ] `ToolCallIndicator` shows running → done with expandable result
- [ ] `token` stream renders character-by-character
- [ ] Driver.js blur + spotlight triggers on `action: highlight`
- [ ] `ALLOWED_ELEMENTS` whitelist prevents unregistered element highlighting
- [ ] Shepherd.js tours launch post-navigation with 650ms delay
- [ ] `autoFillForm()` from ERP-SIH fills ITR fields via `nativeInputValueSetter` pattern
- [ ] Voice orb waveform reacts to mic amplitude in real time
- [ ] `beforeunload` closes WS — no dangling sessions
- [ ] No WS URL hardcoded outside `config/ws.ts`
- [ ] Tailwind v4 `@tailwindcss/vite` used — no `tailwind.config.js`
- [ ] `react-shepherd` not installed — vanilla `shepherd.js` only
