import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Wedding Gift & Crowdfunding Platform"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://tejashr@localhost:5432/wedding_platform")
    SYNC_DATABASE_URL: str = os.getenv("SYNC_DATABASE_URL", "postgresql://tejashr@localhost:5432/wedding_platform")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_jwt_key_wedding_platform_2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_wedding_key_123")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "rzp_test_secret_abc_456")
    RAZORPAY_WEBHOOK_SECRET: str = os.getenv("RAZORPAY_WEBHOOK_SECRET", "webhook_secret_xyz_789")
    PLATFORM_FEE_PERCENT: float = 1.5  # 1.5% platform fee
    GATEWAY_FEE_PERCENT: float = 2.0   # 2.0% gateway fee

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
