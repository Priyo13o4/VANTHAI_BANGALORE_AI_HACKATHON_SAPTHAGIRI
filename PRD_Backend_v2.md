# PRD — VanthAI: Backend (v2.0)

**Stack:** FastAPI · LangGraph · PostgreSQL · Redis · Docker  
**Scope:** Unified backend serving CloudCare and ITR Portal agents  
**Base:** Extended from ERP-SIH navigation + formHelpers pattern

---

## 1. Objectives

Build a single, modular, containerized backend that:

- Serves four WebSocket agent endpoints (CloudCare chat, CloudCare voice, ITR chat, ITR voice)
- Orchestrates LLM reasoning and tool calls via LangGraph 1.0 open-source
- Replaces the ERP-SIH n8n webhook with direct FastAPI WebSocket endpoints
- Stores all session data ephemerally in Redis (TTL=300s, no chat history persisted to disk)
- Serves real application data from PostgreSQL (mirrored CloudCare schema + ITR extension)
- Exposes a typed JSON action protocol that the frontend dispatcher consumes (same contract as ERP-SIH, extended)

---

## 2. Package Versions (Pinned — `pyproject.toml`)

```toml
[project]
requires-python = ">=3.12"

[project.dependencies]
fastapi = "0.136.1"
uvicorn = {extras = ["standard"], version = "0.46.0"}
websockets = "15.0.1"
pydantic = "2.11.4"
pydantic-settings = "2.9.1"

# LangGraph / LangChain (v1.0 stable — April 2026)
langgraph = "1.1.9"
langchain-core = "1.3.2"
langchain-google-genai = "4.2.2"     # ⚠️ BREAKING: migrated to google-genai SDK internally
langchain-openai = "1.1.12"          # Reused for LM Studio (OpenAI-compatible) — ⚠️ major bump - refer Lmstudio.md

# Database
psycopg = {extras = ["binary", "pool"], version = "3.3.3"}
sqlalchemy = {extras = ["asyncio"], version = "2.0.49"}

# Redis
redis = "6.1.0"   # redis.asyncio built-in

# Utilities
python-dotenv = "1.1.0"
structlog = "25.4.0"
httpx = "0.28.1"
```

---

## 3. Environment Configuration

Single `.env` at repo root. Backend reads via `pydantic-settings`. Frontend reads `VITE_*` via Vite.  
**Rule:** No URL, path, model name, or key hardcoded in any `.py` file.

```env
# ── Project ───────────────────────────────────────────────
PROJECT_NAME=vanthai

# ── WebSocket route fragments (FastAPI router registration)
WS_CLOUDCARE_CHAT=ws/v1/vanthai/cloudcare/chatagent
WS_CLOUDCARE_VOICE=ws/v1/vanthai/cloudcare/voiceagent
WS_ITR_CHAT=ws/v1/vanthai/itr/chatagent
WS_ITR_VOICE=ws/v1/vanthai/itr/voiceagent

# ── LLM ───────────────────────────────────────────────────
GOOGLE_AI_API_KEY=your_key_here
GEMMA_TEXT_MODEL=gemma-4-31b-it
LMSTUDIO_BASE_URL=http://host.docker.internal:1234/v1
LMSTUDIO_VOICE_MODEL=gemma-4-e4b

# ── Database ──────────────────────────────────────────────
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=vanthai
POSTGRES_USER=vanthai
POSTGRES_PASSWORD=changeme

# ── Redis ─────────────────────────────────────────────────
REDIS_URL=redis://redis:6379
REDIS_SESSION_TTL=300          # 5 min — sliding window, reset on each message

# ── Frontend WebSocket URLs (consumed by Vite)
VITE_WS_CLOUDCARE_CHAT=ws://localhost:8000/ws/v1/vanthai/cloudcare/chatagent
VITE_WS_CLOUDCARE_VOICE=ws://localhost:8000/ws/v1/vanthai/cloudcare/voiceagent
VITE_WS_ITR_CHAT=ws://localhost:8000/ws/v1/vanthai/itr/chatagent
VITE_WS_ITR_VOICE=ws://localhost:8000/ws/v1/vanthai/itr/voiceagent
```

---

## 4. JSON Action Protocol

This extends the ERP-SIH protocol (`action: navigate`, `action: fillForm`) with new action types.  
The frontend dispatcher handles all types via the same `if/else` chain pattern from ERP-SIH's `handleSendMessage()`.

```json
{
  "message": "Let me take you to your health records.",
  "message_type": "text | quick_reply | step_flow | mermaid",
  "action": "navigate | highlight | autofill | navigate+tour | none",
  "url": "/cloudcare/patient/records",
  "tour": "view-records",
  "element": "[data-chatbot-id='record-latest']",
  "popover": {
    "title": "Your latest record",
    "description": "This shows your most recent visit on 28 April 2026"
  },
  "fill_data": { "pan": "ABCDE1234F", "gross_salary": "750000" },
  "options": ["Show me", "Book appointment", "No thanks"],
  "fieldsNeedingAttention": []
}
```

**Backward-compatible note:** `action: navigate` and `action: fillForm` match the ERP-SIH contract exactly.  
`fill_data` maps to ERP-SIH's `parsed.data`. `fieldsNeedingAttention` is carried over as-is.

---

## 5. Project Structure

```
backend/
├── pyproject.toml
├── Dockerfile
│
├── core/
│   ├── config.py           # pydantic-settings Settings — single import for all env vars
│   ├── db.py               # SQLAlchemy async engine + psycopg3 pool init
│   ├── redis_client.py     # redis.asyncio pool — session CRUD + TTL helpers
│   ├── websocket.py        # BaseWebSocketHandler — connect/disconnect/send/stream
│   └── dispatcher.py       # Parses raw AI JSON → typed ActionPayload (Pydantic)
│
├── agents/
│   ├── base_agent.py       # LangGraph StateGraph — shared nodes: input, llm, tool_router, tool, output
│   │
│   ├── cloudcare/
│   │   ├── agent.py        # Extends base graph; CloudCare system prompt + ROUTE_MANIFEST
│   │   ├── tools.py        # load_page_markdown, query_patient_db, query_doctor_db, query_vitals
│   │   ├── prompts.py      # System prompt strings + KB_URL_MAP + ROUTE_MANIFEST
│   │   └── routes.py       # FastAPI router — WS_CLOUDCARE_CHAT + WS_CLOUDCARE_VOICE endpoints
│   │
│   └── itr/
│       ├── agent.py        # Extends base graph; ITR system prompt + ROUTE_MANIFEST
│       ├── tools.py        # load_page_markdown, itr1_form_schema_loader
│       ├── prompts.py      # System prompt strings + KB_URL_MAP + ROUTE_MANIFEST
│       └── routes.py       # FastAPI router — WS_ITR_CHAT + WS_ITR_VOICE endpoints
│
├── models/
│   ├── cloudcare.py        # SQLAlchemy ORM — mirrors existing CloudCare schema
│   └── itr.py              # Minimal ITR session table (no PII columns)
│
├── migrations/
│   ├── init.sql            # Schema creation
│   └── seed.sql            # Real static data (no mock generation in app code)
│
└── main.py                 # FastAPI app init, lifespan context, router mounts
```

---

## 6. Docker Compose

```yaml
services:

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: .env
    extra_hosts:
      - "host.docker.internal:host-gateway"   # LM Studio on host machine
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ../KB:/app/KB:ro                       # KB markdown — read-only mount

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:8-alpine
    command: redis-server --save "" --appendonly no   # fully ephemeral — no disk writes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
```

---

## 7. Session Management

### Lifecycle

| Event | Action |
|-------|--------|
| WS `CONNECT` | Generate `session_id = uuid4()`. Send `{ type: "session_init", session_id }` as first WS frame. Create Redis hash with TTL=300s |
| Each message received | `EXPIRE session:{id} 300` — sliding window reset |
| WS `DISCONNECT` | `DEL session:{id}` immediately |
| Page reload | New WS connection → new `session_id`. Previous session already deleted on disconnect |

### Redis Session Hash Shape

```
session:{session_id}
  ├── app           "cloudcare" | "itr"
  ├── user_id       patient/doctor ID from DB
  ├── current_page  "/cloudcare/patient/records"
  └── messages      JSON array — rolling 20-turn window, in-memory only
```

**No PII stored anywhere server-side.** `fill_data` travels frontend→frontend in the WS action envelope only.

---

## 8. LangGraph Agent Design

### Base Graph (`base_agent.py`)

```
START → input_node → llm_node → tool_router
                                    ├── tool_node → llm_node  (loop)
                                    └── output_node → END
```

- **`input_node`**: Assembles system prompt + ROUTE_MANIFEST + current_page + rolling message history from Redis
- **`llm_node`**: Calls LLM with streaming. Emits `thinking` tokens and `tool_call` events over WS as they arrive
- **`tool_router`**: If LLM emitted tool calls → `tool_node`. Otherwise → `output_node`
- **`tool_node`**: Executes tools. Results injected back into LangGraph state
- **`output_node`**: Validates final JSON against `ActionPayload` Pydantic model → sends over WS

### WS Streaming Envelope Types

```json
{ "type": "session_init", "session_id": "uuid" }
{ "type": "thinking",     "content": "The user wants to see records..." }
{ "type": "tool_call",    "name": "load_page_markdown", "args": {"url": "/cloudcare/patient/records"}, "status": "running" }
{ "type": "tool_call",    "name": "load_page_markdown", "args": {}, "status": "done", "result_preview": "Page: Patient Records — fields: date, diagnosis..." }
{ "type": "token",        "content": "Let me take" }
{ "type": "action",       "message": "...", "message_type": "quick_reply", "action": "navigate", "url": "...", "options": [...] }
{ "type": "done" }
{ "type": "error",        "message": "..." }
```

### Tool: `load_page_markdown`

Called by the agent immediately when it decides to navigate — before composing the reply.  
This ensures the explanation is grounded in actual page structure (same concept as ERP-SIH's page context injection, but richer).

```python
@tool
def load_page_markdown(url: str) -> str:
    """Load KB markdown for a given page URL to understand its structure."""
    path = KB_URL_MAP.get(url)  # defined in prompts.py
    if not path:
        return "No knowledge base entry for this page."
    return Path(f"/app/KB/{path}").read_text()
```

### ROUTE_MANIFEST (injected in system prompt)

Replaces `ROUTE_ALIASES` from ERP-SIH with a richer semantic map in the system prompt:

```
Available pages:
- /cloudcare/patient/records      → Patient's full medical history and diagnoses
- /cloudcare/patient/appointments → Book and view upcoming appointments
- /cloudcare/patient/vitals       → Real-time wearable vitals dashboard
- /cloudcare/patient/prescriptions→ Active and past prescriptions
- /itr/personal                   → ITR-1 personal information section
- /itr/salary                     → Salary income and HRA section
- /itr/deductions                 → 80C, 80D deductions and Form 16A
- /itr/tax-paid                   → TDS and advance tax entries
```

### System Prompt Structure

```
[ROLE]
You are a navigation and assistance agent for {app_name}.
Always respond with a single JSON object. Never respond with plain text.

[RESPONSE CONTRACT]
{
  "message": string,
  "message_type": "text" | "quick_reply" | "step_flow" | "mermaid",
  "action": "navigate" | "highlight" | "autofill" | "navigate+tour" | "none",
  "url": string | null,
  "tour": string | null,
  "element": string | null,
  "popover": { "title": string, "description": string } | null,
  "fill_data": object | null,
  "options": string[] | null,
  "fieldsNeedingAttention": string[] | null
}

[NAVIGATION MANIFEST]
{route manifest injected here}

[CURRENT CONTEXT]
Current page: {current_page}
User role: {user_role}
{page_markdown injected here when available}
```

---

## 9. Database Schema

### CloudCare Tables (Mirror Existing Schema)

| Table | Agent Usage |
|-------|-------------|
| `patients` | Profile, age, contact |
| `health_records` | Medical history per patient |
| `appointments` | Scheduled visits |
| `prescriptions` | Active and past prescriptions |
| `vitals` | Numeric wearable data (graphical rendering is frontend-only) |
| `doctors` | Doctor profile and specialty |
| `staff` | Hospital staff directory |

### ITR Extension (Minimal)

```sql
CREATE TABLE itr_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(64) NOT NULL,
    form_type VARCHAR(20) DEFAULT 'ITR-1',
    status VARCHAR(20) DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT NOW()
    -- NO PII columns — all tax data is ephemeral, never written here
);
```

**No mock data generation in application code.** All seed data lives in `migrations/seed.sql` — hand-authored, realistic.

---

## 10. API Surface

| Endpoint | Type | App |
|----------|------|-----|
| `/{WS_CLOUDCARE_CHAT}` | WebSocket | CloudCare text agent |
| `/{WS_CLOUDCARE_VOICE}` | WebSocket | CloudCare voice agent (Gemma E4B via LM Studio) |
| `/{WS_ITR_CHAT}` | WebSocket | ITR text agent |
| `/{WS_ITR_VOICE}` | WebSocket | ITR voice agent |
| `GET /health` | HTTP | Docker health check — 200 + version info |
| `GET /docs` | HTTP | FastAPI OpenAPI docs (auto-generated) |

---

## 11. Observability

`structlog` for all logging. Every entry includes `session_id`, `app`, `event_type`. Zero PII in logs.

Optional LangSmith tracing: set `LANGCHAIN_TRACING_V2=true` + `LANGCHAIN_API_KEY` in `.env`. App runs without it.

---

## 12. Acceptance Criteria

- [ ] `docker-compose up` starts all containers with no manual steps beyond `.env` setup
- [ ] All four WS endpoints accept connections and stream typed envelopes
- [ ] `session_init` is the first WS frame on every new connection
- [ ] New `session_id` on every WS connection — no reuse after page reload
- [ ] Redis TTL slides to 300s on each message; session `DEL` on WS disconnect
- [ ] `load_page_markdown` called within same LLM turn as navigation decision
- [ ] `thinking` tokens stream before any `token` output
- [ ] `tool_call` envelopes show `running` → `done` with `result_preview`
- [ ] No hardcoded URLs, paths, model names, or keys in any `.py` file
- [ ] No mock data generation in application code — seed data only in `migrations/seed.sql`
- [ ] No PII written to PostgreSQL or Redis
- [ ] `GET /health` returns 200
- [ ] `langchain-google-genai 4.2.2` and `langchain-openai 1.1.12` breaking changes handled (see migration notes below)

### Migration Notes for New Package Versions

**`langchain-google-genai 4.2.2`:** Internally migrated to `google-genai` SDK. Initialise with:
```python
from langchain_google_genai import ChatGoogleGenerativeAI
llm = ChatGoogleGenerativeAI(model=settings.GEMMA_TEXT_MODEL, google_api_key=settings.GOOGLE_AI_API_KEY)
```
Do not use the old `genai.configure()` pattern — it no longer applies.

**`langchain-openai 1.1.12`:** Use `ChatOpenAI` with `base_url` for LM Studio:
```python
from langchain_openai import ChatOpenAI
voice_llm = ChatOpenAI(model=settings.LMSTUDIO_VOICE_MODEL, base_url=settings.LMSTUDIO_BASE_URL, api_key="lm-studio")
```
