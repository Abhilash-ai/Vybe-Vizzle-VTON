from typing import Dict, List, Optional
from .base import BaseVTONProvider
from .demo_provider import DemoVTONProvider
from .fashn_provider import FashnVTONProvider
from .huggingface_provider import HuggingFaceVTONProvider
from .replicate_provider import ReplicateVTONProvider
from ..config import settings

PROVIDERS: Dict[str, BaseVTONProvider] = {
    "demo": DemoVTONProvider(),
    "fashn": FashnVTONProvider(),
    "huggingface": HuggingFaceVTONProvider(),
    "replicate": ReplicateVTONProvider()
}


def get_provider(provider_name: Optional[str] = None) -> BaseVTONProvider:
    name = (provider_name or settings.VTON_PROVIDER or "demo").lower()
    provider = PROVIDERS.get(name)
    if not provider:
        return PROVIDERS["demo"]
    
    # If selected provider is not available/configured, gracefully fallback to demo provider
    is_ready, _ = provider.is_available()
    if not is_ready and name != "demo":
        return PROVIDERS["demo"]
    
    return provider


def list_all_provider_capabilities() -> List[dict]:
    return [p.get_capabilities() for p in PROVIDERS.values()]
