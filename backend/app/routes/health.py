from fastapi import APIRouter
from ..config import settings
from ..providers import list_all_provider_capabilities

router = APIRouter(tags=["Health & Status"])


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.DEMO_MODE,
        "active_provider": settings.VTON_PROVIDER
    }


@router.get("/providers")
def get_providers_status():
    return {
        "active_provider": settings.VTON_PROVIDER,
        "demo_mode": settings.DEMO_MODE,
        "providers": list_all_provider_capabilities()
    }
