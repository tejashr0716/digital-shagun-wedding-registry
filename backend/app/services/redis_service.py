import asyncio
import json
from typing import Optional, Any
import redis.asyncio as aioredis
from app.config import settings

redis_client: Optional[aioredis.Redis] = None
_redis_loop: Optional[asyncio.AbstractEventLoop] = None

async def get_redis() -> aioredis.Redis:
    global redis_client, _redis_loop
    current_loop = asyncio.get_running_loop()
    if redis_client is None or _redis_loop is not current_loop:
        _redis_loop = current_loop
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
    return redis_client

async def cache_get_json(key: str) -> Optional[Any]:
    try:
        r = await get_redis()
        val = await r.get(key)
        if val:
            return json.loads(val)
    except Exception:
        pass
    return None

async def cache_set_json(key: str, value: Any, ttl_seconds: int = 60) -> None:
    try:
        r = await get_redis()
        await r.set(key, json.dumps(value, default=str), ex=ttl_seconds)
    except Exception:
        pass

async def invalidate_cache(key_pattern: str) -> None:
    try:
        r = await get_redis()
        keys = await r.keys(key_pattern)
        if keys:
            await r.delete(*keys)
    except Exception:
        pass

async def push_live_blessing(wedding_slug: str, blessing_payload: dict) -> None:
    try:
        r = await get_redis()
        key = f"live:blessings:{wedding_slug}"
        await r.lpush(key, json.dumps(blessing_payload, default=str))
        await r.ltrim(key, 0, 49)
        await r.publish(f"channel:blessings:{wedding_slug}", json.dumps(blessing_payload, default=str))
    except Exception:
        pass

async def get_recent_live_blessings(wedding_slug: str, count: int = 20) -> list:
    try:
        r = await get_redis()
        key = f"live:blessings:{wedding_slug}"
        items = await r.lrange(key, 0, count - 1)
        return [json.loads(x) for x in items] if items else []
    except Exception:
        return []
