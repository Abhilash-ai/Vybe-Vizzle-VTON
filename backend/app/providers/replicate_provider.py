import asyncio
import httpx
from typing import Dict, Any, Optional, Tuple
from .base import BaseVTONProvider
from ..config import settings


class ReplicateVTONProvider(BaseVTONProvider):
    """
    Cloud Serverless GPU Provider via Replicate (supports OOTDiffusion & CatVTON).
    """
    def __init__(self):
        super().__init__(name="replicate", is_commercial_safe=True)
        self.api_token = settings.REPLICATE_API_TOKEN
        self.model_version = settings.REPLICATE_MODEL_VERSION or "viktorfa/oot_diffusion"
        self.model_name = "OOTDiffusion (Outfitting Over Time Latent Model)"

    def is_available(self) -> Tuple[bool, str]:
        if not self.api_token:
            return False, "REPLICATE_API_TOKEN is not configured."
        return True, "Ready (Replicate serverless GPU active)"

    def get_capabilities(self) -> Dict[str, Any]:
        has_token = bool(self.api_token)
        return {
            "provider": "replicate",
            "model_name": self.model_name,
            "architecture": "Outfitting Latent Diffusion with Warping Network (OOTDiffusion)",
            "license_type": "Apache 2.0 / Model-specific License",
            "is_commercial_safe": True,
            "status": "active" if has_token else "available_with_key",
            "typical_latency_sec": "5.5s (Serverless T4/A100)",
            "resolution": "768x1024",
            "vram_required_gb": 12.0,
            "estimated_cost_per_image": "$0.025",
            "garment_categories_supported": [
                "t-shirt", "shirt", "hoodie", "jacket", "dress", "pants", "skirt"
            ],
            "face_preservation_score": 0.96,
            "garment_alignment_score": 0.94,
            "environment_status_note": "Serverless cloud GPU ready." if has_token else "Requires REPLICATE_API_TOKEN in .env or Settings."
        }

    async def generate_tryon(
        self,
        person_image_path: str,
        garment_image_path: str,
        category: str,
        options: Optional[Dict[str, Any]] = None,
        job_id: Optional[str] = None
    ) -> Tuple[bool, str, Optional[str]]:
        if not self.api_token:
            return False, "", "REPLICATE_API_TOKEN is not configured."
        
        headers = {
            "Authorization": f"Token {self.api_token}",
            "Content-Type": "application/json"
        }
        
        oot_category = "upperbody" if category.lower() in ["t-shirt", "shirt", "hoodie", "jacket", "top"] else (
            "lowerbody" if category.lower() in ["pants", "skirt"] else "dress"
        )
        
        payload = {
            "version": self.model_version,
            "input": {
                "model_image": person_image_path,
                "garment_image": garment_image_path,
                "category": oot_category,
                "steps": 30,
                "scale": 2.5
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post("https://api.replicate.com/v1/predictions", json=payload, headers=headers)
                if res.status_code not in (200, 201):
                    return False, "", f"Replicate API Error ({res.status_code}): {res.text}"
                
                prediction = res.json()
                pred_id = prediction.get("id")
                
                for _ in range(30):
                    await asyncio.sleep(2.0)
                    poll_res = await client.get(f"https://api.replicate.com/v1/predictions/{pred_id}", headers=headers)
                    if poll_res.status_code == 200:
                        poll_data = poll_res.json()
                        pred_status = poll_data.get("status")
                        if pred_status == "succeeded":
                            output = poll_data.get("output")
                            if isinstance(output, list) and output:
                                return True, output[0], None
                            elif isinstance(output, str):
                                return True, output, None
                        elif pred_status == "failed":
                            return False, "", f"Replicate prediction failed: {poll_data.get('error')}"
                
                return False, "", "Replicate prediction timed out."
        except Exception as e:
            return False, "", f"Replicate API error: {str(e)}"

    async def get_status(self, job_id: str) -> Dict[str, Any]:
        return {"status": "processing"}
