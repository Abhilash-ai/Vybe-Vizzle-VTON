import httpx
import os
from typing import Dict, Any, Optional, Tuple
from .base import BaseVTONProvider
from ..config import settings


class HuggingFaceVTONProvider(BaseVTONProvider):
    """
    Open-Source / Research VTON Provider for IDM-VTON / CatVTON models
    hosted on Hugging Face Spaces or Dedicated Inference Endpoints.
    """
    def __init__(self):
        super().__init__(name="huggingface", is_commercial_safe=False)
        self.api_token = settings.HUGGINGFACE_API_TOKEN
        self.endpoint = settings.HUGGINGFACE_MODEL_ENDPOINT
        self.model_name = "IDM-VTON (Improving Diffusion Models for Virtual Try-ON)"

    def is_available(self) -> Tuple[bool, str]:
        if not self.endpoint and not self.api_token:
            return False, "HUGGINGFACE_API_TOKEN / HUGGINGFACE_MODEL_ENDPOINT not configured."
        return True, "Ready (Hugging Face endpoint active)"

    def get_capabilities(self) -> Dict[str, Any]:
        has_ep = bool(self.endpoint or self.api_token)
        return {
            "provider": "huggingface",
            "model_name": self.model_name,
            "architecture": "UNet + IP-Adapter Garment Attention (IDM-VTON)",
            "license_type": "Academic Non-Commercial License (CC-BY-NC-SA 4.0)",
            "is_commercial_safe": False,
            "status": "active" if has_ep else "available_with_key",
            "typical_latency_sec": "8.0s (A100 GPU)",
            "resolution": "768x1024",
            "vram_required_gb": 16.0,
            "estimated_cost_per_image": "$0.012 (GPU time)",
            "garment_categories_supported": [
                "t-shirt", "shirt", "hoodie", "jacket", "dress", "pants", "skirt"
            ],
            "face_preservation_score": 0.94,
            "garment_alignment_score": 0.95,
            "environment_status_note": "Research model. Endpoint configured." if has_ep else "Requires HuggingFace endpoint or local A100 GPU."
        }

    async def generate_tryon(
        self,
        person_image_path: str,
        garment_image_path: str,
        category: str,
        options: Optional[Dict[str, Any]] = None,
        job_id: Optional[str] = None
    ) -> Tuple[bool, str, Optional[str]]:
        if not self.endpoint:
            return False, "", "HUGGINGFACE_MODEL_ENDPOINT is not configured."
        
        headers = {"Authorization": f"Bearer {self.api_token}"} if self.api_token else {}
        payload = {
            "inputs": {
                "human_img": person_image_path,
                "garm_img": garment_image_path,
                "garment_des": category,
                "is_checked": True,
                "is_checked_crop": False,
                "denoise_steps": 30,
                "seed": 42
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(self.endpoint, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    # Return result URL or base64
                    return True, data.get("result", ""), None
                return False, "", f"Hugging Face API error ({res.status_code}): {res.text}"
        except Exception as e:
            return False, "", f"Hugging Face request failed: {str(e)}"

    async def get_status(self, job_id: str) -> Dict[str, Any]:
        return {"status": "processing"}
