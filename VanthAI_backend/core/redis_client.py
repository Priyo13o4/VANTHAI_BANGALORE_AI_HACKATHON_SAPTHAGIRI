"""
VanthAI Backend — Redis Client
Async pool with session CRUD + sliding TTL helpers.
No PII is ever written to Redis.
"""
import json
from typing import Any
from uuid import uuid4

import redis.asyncio as aioredis
import structlog

from core.config import settings

logger = structlog.get_logger(__name__)

_pool: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    """Return the shared async Redis pool (initialized on startup)."""
    if _pool is None:
        raise RuntimeError("Redis pool not initialized. Call init_redis() first.")
    return _pool


async def init_redis() -> None:
    global _pool
    _pool = aioredis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
        max_connections=50,
    )
    await _pool.ping()
    logger.info("redis.connected", url=settings.redis_url)


async def close_redis() -> None:
    if _pool:
        await _pool.aclose()
        logger.info("redis.closed")


# ── Session helpers ────────────────────────────────────────────────────────────

def _session_key(session_id: str) -> str:
    return f"session:{session_id}"


async def create_session(app: str, user_id: str | None = None) -> str:
    """
    Create a new ephemeral session in Redis.
    Returns the new session_id (uuid4).
    No PII is stored — user_id is an opaque DB row id only.
    """
    session_id = str(uuid4())
    key = _session_key(session_id)
    r = get_redis()

    session_data: dict[str, Any] = {
        "app": app,
        "user_id": user_id or "",
        "current_page": f"/{app}",
        "messages": json.dumps([]),  # rolling 20-turn window
    }

    async with r.pipeline(transaction=True) as pipe:
        pipe.hset(key, mapping=session_data)
        pipe.expire(key, settings.redis_session_ttl)
        await pipe.execute()

    logger.info("session.created", session_id=session_id, app=app)
    return session_id


async def get_session(session_id: str) -> dict[str, Any] | None:
    """Retrieve session data. Returns None if expired/missing."""
    r = get_redis()
    data = await r.hgetall(_session_key(session_id))
    if not data:
        return None
    # Deserialize messages from JSON string
    if "messages" in data:
        data["messages"] = json.loads(data["messages"])
    return data


async def update_session_page(session_id: str, current_page: str) -> None:
    """Update the current_page field and slide the TTL window."""
    r = get_redis()
    key = _session_key(session_id)
    async with r.pipeline(transaction=True) as pipe:
        pipe.hset(key, "current_page", current_page)
        pipe.expire(key, settings.redis_session_ttl)
        await pipe.execute()


async def append_message(session_id: str, role: str, content: str) -> None:
    """
    Append a message to the rolling 20-turn window.
    Slides the TTL on every write.
    """
    r = get_redis()
    key = _session_key(session_id)
    raw = await r.hget(key, "messages") or "[]"
    messages: list[dict] = json.loads(raw)
    messages.append({"role": role, "content": content})
    # Keep only last 20 turns (40 messages)
    messages = messages[-40:]
    async with r.pipeline(transaction=True) as pipe:
        pipe.hset(key, "messages", json.dumps(messages))
        pipe.expire(key, settings.redis_session_ttl)  # ← sliding window reset
        await pipe.execute()


async def delete_session(session_id: str) -> None:
    """Delete session immediately on WS disconnect."""
    r = get_redis()
    await r.delete(_session_key(session_id))
    logger.info("session.deleted", session_id=session_id)
