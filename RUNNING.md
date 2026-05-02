# VanthAI — Complete Setup & Run Guide

> **TL;DR** — The only thing you must configure yourself is a single API key in `.env`. After that, run `./start.sh` and open `http://localhost:5173`.

---

## Table of Contents

1. [Prerequisites — Install These First](#1-prerequisites)
2. [What You Must Configure](#2-what-you-must-configure)
3. [Full `.env` Reference](#3-full-env-reference)
4. [Starting the Project](#4-starting-the-project)
5. [Verifying Everything Works](#5-verifying-everything-works)
6. [Running Tests](#6-running-tests)
7. [Voice Mode (LM Studio)](#7-voice-mode-lm-studio)
8. [Stopping the Stack](#8-stopping-the-stack)
9. [Troubleshooting](#9-troubleshooting)
10. [Architecture Quick Reference](#10-architecture-quick-reference)

---

## 1. Prerequisites

Install all of these before doing anything else.

### Required (non-negotiable)

| Tool | Version | Install |
|---|---|---|
| **Node.js** | ≥ 20 | `brew install node` |
| **Docker Desktop** | Latest | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| **Python** | ≥ 3.12 | `brew install python@3.12` |
| **Google AI API Key** | — | [aistudio.google.com](https://aistudio.google.com/apikey) — free tier works |

### Optional (for voice mode only)

| Tool | Version | Install |
|---|---|---|
| **LM Studio** | ≥ 0.3.x | [lmstudio.ai](https://lmstudio.ai/) |

### Verify prerequisites

```bash
node --version      # should print v20+
docker --version    # should print Docker version 26+
python3 --version   # should print 3.12+
```

---

## 2. What You Must Configure

> There is **only one thing** you absolutely must set yourself. Everything else has working defaults.

### ✅ Required: Google AI API Key

Open `.env` in the repo root and replace `your_key_here`:

```env
GOOGLE_AI_API_KEY=your_key_here   ← change this line only
```

Get a free key at **https://aistudio.google.com/apikey** (no billing required for Gemma models).

---

### ⚠️ Optional but Recommended: Change the Database Password

The default password is `changeme` — fine for a hackathon demo, change it for any real deployment:

```env
POSTGRES_PASSWORD=changeme    ← change this if deploying beyond localhost
```

> **Important:** If you change `POSTGRES_PASSWORD`, do it **before** running Docker for the first time. If Docker already created the volume with the old password, run `docker compose down -v` first (this wipes the database — the seed data will be re-applied on next `docker compose up`).

---

### ⚠️ Optional: LangSmith Tracing

If you want to trace LangGraph agent calls, uncomment these two lines in `.env`:

```env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_key_here
```

Get a free key at **https://smith.langchain.com**. The app runs perfectly without this.

---

### ✅ Everything Else is Pre-configured

These values are already correct — **do not change them**:

```env
GEMMA_TEXT_MODEL=gemma-4-31b-it        # the text agent model
POSTGRES_HOST=postgres                  # Docker service name — must match docker-compose.yml
REDIS_URL=redis://redis:6379            # Docker service name — must match docker-compose.yml
LMSTUDIO_BASE_URL=http://host.docker.internal:1234/v1  # voice (LM Studio on host)
```

---

## 3. Full `.env` Reference

```env
# ── Project ───────────────────────────────────────────────
PROJECT_NAME=vanthai                    # Used in logs and Docker labels

# ── WebSocket Route Fragments ─────────────────────────────
WS_CLOUDCARE_CHAT=ws/v1/vanthai/cloudcare/chatagent
WS_CLOUDCARE_VOICE=ws/v1/vanthai/cloudcare/voiceagent
WS_ITR_CHAT=ws/v1/vanthai/itr/chatagent
WS_ITR_VOICE=ws/v1/vanthai/itr/voiceagent

# ── LLM ───────────────────────────────────────────────────
GOOGLE_AI_API_KEY=YOUR_KEY_HERE         # ⬅ YOU MUST SET THIS
GEMMA_TEXT_MODEL=gemma-4-31b-it         # Text agent model (via Google AI)
LMSTUDIO_BASE_URL=http://host.docker.internal:1234/v1  # Voice only
LMSTUDIO_VOICE_MODEL=gemma-4-e4b        # Voice model served by LM Studio

# ── Database (PostgreSQL) ─────────────────────────────────
POSTGRES_HOST=postgres                  # Docker service name — do not change
POSTGRES_PORT=5432
POSTGRES_DB=vanthai
POSTGRES_USER=vanthai
POSTGRES_PASSWORD=changeme              # ⬅ Change for non-demo use

# ── Redis (ephemeral session store) ──────────────────────
REDIS_URL=redis://redis:6379            # Docker service name — do not change
REDIS_SESSION_TTL=300                   # Session expires 5 min after last message

# ── Frontend WebSocket URLs (Vite reads VITE_* vars) ─────
VITE_WS_CLOUDCARE_CHAT=ws://localhost:8000/ws/v1/vanthai/cloudcare/chatagent
VITE_WS_CLOUDCARE_VOICE=ws://localhost:8000/ws/v1/vanthai/cloudcare/voiceagent
VITE_WS_ITR_CHAT=ws://localhost:8000/ws/v1/vanthai/itr/chatagent
VITE_WS_ITR_VOICE=ws://localhost:8000/ws/v1/vanthai/itr/voiceagent

# ── Optional Observability ────────────────────────────────
# LANGCHAIN_TRACING_V2=true
# LANGCHAIN_API_KEY=your_langsmith_key_here
```

---

## 4. Starting the Project

### Option A — One Command (Recommended)

```bash
cd /path/to/BANGALORE_AI_HACKATHON_SAPTHAGIRI

# Make sure GOOGLE_AI_API_KEY is set in .env, then:
./start.sh
```

This does everything automatically:
1. Validates `.env` exists
2. Checks Docker is running
3. Builds and starts the Docker stack (FastAPI + PostgreSQL + Redis)
4. Waits for the backend health check to pass
5. Installs frontend `node_modules` if needed
6. Starts the Vite dev server

**You'll see this when ready:**
```
╔══════════════════════════════════════════════════════╗
║  VanthAI is running!                                 ║
║  Frontend:  http://localhost:5173                    ║
║  Backend:   http://localhost:8000                    ║
║  API Docs:  http://localhost:8000/docs               ║
╚══════════════════════════════════════════════════════╝
```

---

### Option B — Manual Step-by-Step

**Step 1 — Start Docker backend:**
```bash
cd /path/to/BANGALORE_AI_HACKATHON_SAPTHAGIRI
docker compose up -d --build
```

**Step 2 — Wait for backend health:**
```bash
# Run until you get: {"status":"ok"}
curl http://localhost:8000/health
```

**Step 3 — Start the frontend:**
```bash
cd VanthAI_frontend
npm install --legacy-peer-deps
npm run dev
```

**Step 4 — Open browser:** `http://localhost:5173`

---

## 5. Verifying Everything Works

### ✅ Backend health
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok","version":"0.1.0","services":{"redis":"connected","db":"connected"}}
```

### ✅ API docs available
Open: **http://localhost:8000/docs**
You should see FastAPI Swagger UI with 4 WebSocket endpoints listed.

### ✅ Frontend loads
Open: **http://localhost:5173**
You should see:
- VanthAI sidebar on the left (CloudCare / ITR switcher)
- Patient dashboard in the main area
- 🤖 chat bubble button in the bottom-right corner

### ✅ Chat widget connects
1. Click the **🤖** button (bottom right)
2. Header should show **● Live** (not ○ Offline)
3. Type: `"Take me to my appointments"`
4. Agent should navigate you to the Appointments page and explain it

### ✅ Docker containers healthy
```bash
docker compose ps
# All three should show "healthy" or "running":
# vanthai-backend-1   Up (healthy)
# vanthai-postgres-1  Up (healthy)
# vanthai-redis-1     Up (healthy)
```

---

## 6. Running Tests

10 critical tests covering: dispatcher parsing, ITR tax calculator, KB map completeness, settings contract, and ERP-SIH backward compatibility.

```bash
cd VanthAI_backend

# Install test deps (first time only)
pip install pytest langchain-core langchain-google-genai langchain-openai \
            pydantic pydantic-settings structlog redis python-dotenv

# Run
python -m pytest tests/ -v
```

**Expected output:**
```
tests/test_critical.py::test_dispatcher_parses_navigate          PASSED
tests/test_critical.py::test_dispatcher_parses_highlight         PASSED
tests/test_critical.py::test_dispatcher_strips_markdown_fences   PASSED
tests/test_critical.py::test_dispatcher_returns_none_on_garbage  PASSED
tests/test_critical.py::test_itr_tax_calculator_basic            PASSED
tests/test_critical.py::test_itr_tax_calculator_caps_deductions  PASSED
tests/test_critical.py::test_kb_url_map_has_all_cloudcare_routes PASSED
tests/test_critical.py::test_itr_url_map_has_all_itr_routes     PASSED
tests/test_critical.py::test_settings_ws_paths_use_env           PASSED
tests/test_critical.py::test_fillform_action_compat              PASSED

10 passed in 0.31s
```

---

## 7. Voice Mode (LM Studio)

The voice button (🎙️) exists in the chat widget but shows a placeholder. To fully wire it:

### Step 1 — Set up LM Studio

1. Download **LM Studio** from [lmstudio.ai](https://lmstudio.ai/)
2. Open LM Studio → **Discover** tab → search `gemma-4-e4b`
3. Download the model (≈ 4GB)
4. Go to **Local Server** tab → select `gemma-4-e4b` → click **Start Server**

### Step 2 — Verify LM Studio reachable

```bash
curl http://localhost:1234/v1/models
# Should return JSON list containing gemma-4-e4b
```

### Step 3 — What's left to implement

The `.env` is already pre-configured. In `VanthAI_backend/agents/cloudcare/routes.py`, implement the voice handler body:

```python
from langchain_openai import ChatOpenAI
from core.config import settings

# ⚠️ langchain-openai 1.1.12: use base_url kwarg (not openai_api_base)
voice_llm = ChatOpenAI(
    model=settings.lmstudio_voice_model,
    base_url=settings.lmstudio_base_url,
    api_key="lm-studio",   # LM Studio ignores this value but requires it
    streaming=True,
)
```

> `host.docker.internal` in `LMSTUDIO_BASE_URL` lets the Docker container reach LM Studio on your Mac. Already added in `docker-compose.yml` via `extra_hosts`.

---

## 8. Stopping the Stack

### Stop the frontend dev server
Press `Ctrl+C` in the terminal running `./start.sh` or `npm run dev`.

### Stop Docker backend
```bash
# From the repo root:
docker compose down

# Fresh start (deletes database — seed data is re-applied on next up):
docker compose down -v
```

### Stop everything at once
```bash
pkill -f "vite" 2>/dev/null; docker compose down
```

---

## 9. Troubleshooting

### ❌ "Backend health check timed out" (start.sh)

```bash
# See what went wrong:
docker compose logs backend --tail=50
```

**Common causes:**
- `GOOGLE_AI_API_KEY` is still `your_key_here` → Python import fails at startup
- Port 8000 already in use: `lsof -i :8000 | grep LISTEN`
- Docker ran out of memory → increase Docker Desktop RAM limit to ≥ 4GB in Settings → Resources

---

### ❌ Chat widget shows "○ Offline"

The browser can't reach the backend WebSocket.

1. Is the backend running? → `curl http://localhost:8000/health`
2. Check browser console for WebSocket errors
3. Did you change `.env` after starting Vite? → Restart `npm run dev` (Vite caches env vars)

---

### ❌ Agent responds but nothing happens in the UI

The LLM returned an action but the frontend didn't dispatch it.

1. Open browser **DevTools → Network → WS** tab
2. Click the active WebSocket connection
3. Look at the messages — find the `action` frame and check if `action` field is set correctly
4. If `action` is `"none"`, the LLM decided not to navigate — try rephrasing the request

---

### ❌ TypeScript errors / blank page in frontend

```bash
cd VanthAI_frontend
rm -rf node_modules
npm install --legacy-peer-deps
npx tsc --noEmit        # should return 0 errors
npm run dev
```

---

### ❌ PostgreSQL container unhealthy

Volume conflict from a previous run:
```bash
docker compose down -v     # ⚠️ deletes data
docker compose up -d --build
```

---

### ❌ "GOOGLE_AI_API_KEY is not set"

```bash
# Confirm your key is set:
grep GOOGLE_AI_API_KEY .env

# Rebuild after setting:
docker compose down
docker compose up -d --build
```

---

## 10. Architecture Quick Reference

```
Browser (localhost:5173)
  │  WebSocket ws://localhost:8000/ws/v1/vanthai/cloudcare/chatagent
  ▼
FastAPI Backend (localhost:8000)
  │
  ├── WS Lifecycle   core/websocket.py    session_init → message → disconnect
  ├── Session Store  core/redis_client.py Redis TTL=300s, ephemeral, no PII
  │
  └── LangGraph Agent
        START → input_node → llm_node → tool_router
                                           ├── tool_node → llm_node  (loop)
                                           └── output_node → END
        
        LLM (text):  Gemma 4 31B  via Google AI API
        LLM (voice): Gemma E4B    via LM Studio on localhost:1234
        Tools:       load_page_markdown, query_patient_summary,
                     query_upcoming_appointments, query_active_prescriptions,
                     query_latest_vitals, itr1_tax_calculator, itr1_form_schema

  ├── PostgreSQL (localhost:5432) — Patient records, appointments, etc.
  └── Redis      (localhost:6379) — Session history only (in-memory, no disk)

Frontend (VanthAI_frontend/)
  Vite 6 + React 19 + Tailwind v4
  Hooks: useWebSocket → useAIDispatcher → navigate / highlight / autofill
  Tours: Shepherd.js 15.x (string action API)
  Spotlight: driver.js (lazy-loaded on demand)
```

### URL Quick Reference

| URL | What |
|---|---|
| `http://localhost:5173` | App (Vite dev server) |
| `http://localhost:5173/cloudcare` | Patient dashboard |
| `http://localhost:5173/cloudcare/patient/appointments` | Appointments |
| `http://localhost:5173/cloudcare/patient/vitals` | Wearable vitals |
| `http://localhost:5173/cloudcare/patient/records` | Medical records |
| `http://localhost:5173/cloudcare/patient/prescriptions` | Prescriptions |
| `http://localhost:5173/itr` | ITR portal |
| `http://localhost:8000` | FastAPI backend |
| `http://localhost:8000/health` | Health check endpoint |
| `http://localhost:8000/docs` | Swagger API docs |

---

## Pre-Flight Checklist

| # | Task | Done? |
|---|---|---|
| 1 | Install Node.js ≥ 20 | ☐ |
| 2 | Install Docker Desktop | ☐ |
| 3 | Install Python ≥ 3.12 | ☐ |
| 4 | Get Google AI API key from aistudio.google.com | ☐ |
| 5 | Open `.env` → set `GOOGLE_AI_API_KEY=<your key>` | ☐ |
| 6 | Start Docker Desktop | ☐ |
| 7 | Run `./start.sh` | ☐ |
| 8 | Open `http://localhost:5173` | ☐ |
| 9 | Click 🤖 → verify **● Live** status | ☐ |
| 10 | Type `"Take me to my appointments"` → verify navigation | ☐ |
