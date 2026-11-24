from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.services.redis_service import get_redis
from app.routers import auth, weddings, goals, gifts, webhooks, analytics, ai_concierge

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ping redis
    try:
        r = await get_redis()
        await r.ping()
        print("✅ Redis connection verified")
    except Exception as e:
        print(f"⚠️ Redis warning: {e}")
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade, 3-tier wedding registry and goal-based cash gifting platform.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Next.js local dev & preview origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(weddings.router)
app.include_router(goals.router)
app.include_router(gifts.router)
app.include_router(webhooks.router)
app.include_router(analytics.router)
app.include_router(ai_concierge.router)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "wedding-crowdfunding-api",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to Wedding Gift & Crowdfunding Platform API",
        "docs_url": "/docs",
        "demo_wedding": "/api/v1/weddings/public/priya-and-rohit"
    }
