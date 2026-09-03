from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import settings, DATA_DIR, UPLOADS_DIR, RESULTS_DIR, SAMPLES_DIR
from .database import engine, Base, SessionLocal
from .routes import api_router
from .utils.sample_generator import generate_sample_assets


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize database schema
    Base.metadata.create_all(bind=engine)
    # 2. Ensure verified sample model portraits and garments exist on disk
    try:
        generate_sample_assets()
    except Exception as e:
        print(f"[Warning] Failed to verify sample assets on startup: {e}")

    yield


app = FastAPI(
    title="Vizzle VTON Model Evaluation Workbench",
    description="Empirical benchmark and evaluation system for Virtual Try-On AI models across 10 clothing categories (Saree, Kurti, Lehenga, etc.)",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static asset folders
app.mount("/data", StaticFiles(directory=str(DATA_DIR)), name="data")

# Register API routes
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "company": "Vizzle",
        "product": "Vizzle VTON",
        "system": "Virtual Try-On Model Evaluation Workbench",
        "objective": "Identify best VTON AI model for production (Accuracy, Speed < 15s, Cost < Rs 4/gen)",
        "version": "2.0.0",
        "categories_tested": 10,
        "docs": "/docs",
        "api_v1": "/api/v1"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "An unexpected server error occurred.",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else None
        }
    )
