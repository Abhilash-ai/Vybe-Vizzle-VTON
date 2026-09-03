from fastapi import APIRouter
from .auth import router as auth_router
from .tryon import router as tryon_router
from .garments import router as garments_router
from .looks import router as looks_router
from .outfits import router as outfits_router
from .benchmarks import router as benchmarks_router
from .user import router as user_router
from .health import router as health_router
from .evaluation import router as eval_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(eval_router)
api_router.include_router(auth_router)
api_router.include_router(tryon_router)
api_router.include_router(garments_router)
api_router.include_router(looks_router)
api_router.include_router(outfits_router)
api_router.include_router(benchmarks_router)
api_router.include_router(user_router)
