"""
VanthAI Backend — FastAPI Application
Lifespan context: Redis pool init + DB warmup.
Routers for CloudCare and ITR agents are mounted here.
"""
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.redis_client import close_redis, init_redis

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────
    logger.info("vanthai.startup", project=settings.project_name)
    await init_redis()
    yield
    # ── Shutdown ─────────────────────────────────────────────
    await close_redis()
    logger.info("vanthai.shutdown")


app = FastAPI(
    title="VanthAI Backend",
    version="0.1.0",
    description="Unified AI backend for CloudCare and ITR Portal agents.",
    lifespan=lifespan,
)

# CORS — allow Vite dev server and any Docker network origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["infra"])
async def health() -> dict:
    return {"status": "ok", "version": "0.1.0", "project": settings.project_name}


# ── Agent Routers ─────────────────────────────────────────────────────────────
# Imported here to avoid circular imports; routers use settings for path registration.
from agents.cloudcare.routes import router as cloudcare_router  # noqa: E402
from agents.itr.routes import router as itr_router  # noqa: E402

app.include_router(cloudcare_router)
app.include_router(itr_router)
