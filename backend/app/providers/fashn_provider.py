import httpx
import os
import time
from typing import Dict, Any, Optional, Tuple
from .base import BaseVTONProvider
from ..config import settings


class FashnVTONProvider(BaseVTONProvider):
    """
    Commercial Production VTON Provider via FASHN API.
    Provides state-of-the-art neural virtual try-on with high face and garment fidelity.
    """
    def __init__(self):
        super().__init__(name="fashn", is_commercial_safe=True)
        self.api_key = settings.FASHN_API_KEY
        self.api_url = settings.FASHN_API_URL
        self.model_name = "FASHN v1.5 Try-On API (Commercial)"

    def is_available(self) -> Tuple[bool, str]:
        if not self.api_key:
            return False, "FASHN_API_KEY environment variable is not configured."
        return True, "Ready (Commercial FASHN API active)"

    def get_capabilities(self) -> Dict[str, Any]:
        has_key = bool(self.api_key)
        return {
            "provider": "fashn",
            "model_name": self.model_name,
            "architecture": "Commercial Multi-Layer Latent Diffusion",
            "license_type": "Commercial API License",
            "is_commercial_safe": True,
            "status": "active" if has_key else "available_with_key",
            "typical_latency_sec": "6.5s",
            "resolution": "1024x1024 (HD)",
            "vram_required_gb": 0.0,  # Cloud hosted
            "estimated_cost_per_image": "$0.045",
            "garment_categories_supported": [
                "t-shirt", "shirt", "hoodie", "jacket", "dress",
                "saree", "kurta", "pants", "skirt", "other"
            ],
            "face_preservation_score": 0.98,
            "garment_alignment_score": 0.97,
            "environment_status_note": "Production cloud endpoint ready." if has_key else "Requires FASHN_API_KEY in .env or Settings."
        }

    async def generate_tryon(
        self,
        person_image_path: str,
        garment_image_path: str,
        category: str,
        options: Optional[Dict[str, Any]] = None,
        job_id: Optional[str] = None
    ) -> Tuple[bool, str, Optional[str]]:
        if not self.api_key:
            return False, "", "FASHN_API_KEY is not configured on the server."
        
        options = options or {}
        
        # Map categories to FASHN garment types
        category_map = {
            "t-shirt": "tops",
            "shirt": "tops",
            "hoodie": "tops",
            "jacket": "tops",
            "dress": "one-pieces",
            "saree": "one-pieces",
            "kurta": "tops",
            "pants": "bottoms",
            "skirt": "bottoms",
            "other": "auto"
        }
        fashn_category = category_map.get(category.lower(), "auto")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model_image": person_image_path,  # Public URL or base64
            "garment_image": garment_image_path,
            "category": fashn_category,
            "mode": "performance" if options.get("generation_quality") == "standard" else "quality",
            "adjust_hands": True,
            "restore_background": options.get("preserve_background", True),
            "restore_clothes": False
        }
        
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(f"{self.api_url}/run", json=payload, headers=headers)
                if res.status_code not in (200, 201):
                    return False, "", f"FASHN API Error ({res.status_code}): {res.text}"
                
                data = res.json()
                fashn_id = data.get("id")
                
                # Poll status
                for _ in range(30):
                    await asyncio.sleep(2.0)
                    status_res = await client.get(f"{self.api_url}/status/{fashn_id}", headers=headers)
                    if status_res.status_code == 200:
                        status_data = status_res.json()
                        if status_data.get("status") == "completed":
                            output_urls = status_data.get("output", [])
                            if output_urls:
                                return True, output_urls[0], None
                        elif status_data.get("status") == "failed":
                            return False, "", f"FASHN Generation Failed: {status_data.get('error')}"
                
                return False, "", "FASHN API inference timed out after 60 seconds."
        except Exception as e:
            return False, "", f"FASHN API Network Exception: {str(e)}"

    async def get_status(self, job_id: str) -> Dict[str, Any]:
        return {"status": "processing"}
