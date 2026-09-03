import os
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
RESULTS_DIR = DATA_DIR / "results"
SAMPLES_DIR = DATA_DIR / "samples"

# Ensure directories exist
for directory in [DATA_DIR, UPLOADS_DIR, RESULTS_DIR, SAMPLES_DIR]:
    directory.mkdir(parents=True, exist_ok=True)


class Settings:
    PROJECT_NAME: str = "Vizzle VTON"
    PROJECT_DESCRIPTION: str = "AI-Powered Virtual Fashion Try-On Platform by AM Studio"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Environment & Provider
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    VTON_PROVIDER: str = os.getenv("VTON_PROVIDER", "demo")  # demo, fashn, huggingface, replicate

    # External VTON API Keys (Optional - only needed for real remote inference)
    FASHN_API_KEY: str = os.getenv("FASHN_API_KEY", "")
    FASHN_API_URL: str = os.getenv("FASHN_API_URL", "https://api.fashn.ai/v1")
    
    HUGGINGFACE_API_TOKEN: str = os.getenv("HUGGINGFACE_API_TOKEN", "")
    HUGGINGFACE_MODEL_ENDPOINT: str = os.getenv("HUGGINGFACE_MODEL_ENDPOINT", "")
    
    REPLICATE_API_TOKEN: str = os.getenv("REPLICATE_API_TOKEN", "")
    REPLICATE_MODEL_VERSION: str = os.getenv("REPLICATE_MODEL_VERSION", "")

    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "am-studio-vizzle-vton-super-secret-key-2026-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR}/vizzle_vton.db")

    # File storage limits
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: set = {"png", "jpg", "jpeg", "webp"}

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]


settings = Settings()
