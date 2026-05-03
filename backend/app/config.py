from pydantic_settings import BaseSettings
from typing import Optional
import os

# Always resolve uploads relative to this file's location (backend/app/../uploads)
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+psycopg://slo_user:slo_pass@localhost:5432/slo_explorer"

    # Auth
    SECRET_KEY: str = "change-me-in-production-use-a-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # File uploads — absolute path so it works regardless of cwd
    UPLOAD_DIR: str = os.path.join(_BASE_DIR, "uploads")
    MAX_UPLOAD_SIZE_MB: int = 10

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # AI
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
