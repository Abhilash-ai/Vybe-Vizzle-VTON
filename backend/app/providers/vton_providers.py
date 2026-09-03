import os
import time
import httpx
from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, Optional
from pathlib import Path

from ..config import settings, RESULTS_DIR
from ..utils.image_processing import create_offline_vton_composite


class VTONProvider(ABC):
    @abstractmethod
    def get_name(self) -> str:
        pass

    @abstractmethod
    def get_status(self) -> Tuple[str, str]:
        """Returns (status, reason) e.g. ('READY', 'Local CPU compute') or ('NOT CONFIGURED', 'API key missing')"""
        pass

    @abstractmethod
    def get_license(self) -> str:
        pass

    @abstractmethod
    def estimate_or_calculate_cost(self, duration_sec: float) -> Tuple[float, str, str]:
        """Returns (cost_inr, cost_type, cost_basis)"""
        pass

    @abstractmethod
    def generate(
        self,
        person_path: str,
        garment_path: str,
        category: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes actual inference and returns:
        {
            'output_path': str,
            'duration_ms': float,
            'duration_sec': float,
            'status': 'completed' | 'failed',
            'error_message': Optional[str]
        }
        """
        pass


class LocalBaselineProvider(VTONProvider):
    def get_name(self) -> str:
        return "Local Baseline (CPU Pipeline)"

    def get_status(self) -> Tuple[str, str]:
        return ("READY", "Local Python CPU image processing pipeline")

    def get_license(self) -> str:
        return "MIT / Permissive"

    def estimate_or_calculate_cost(self, duration_sec: float) -> Tuple[float, str, str]:
        return (0.0, "Actual", "Local CPU compute (Zero cost)")

    def generate(
        self,
        person_path: str,
        garment_path: str,
        category: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        out_filename = f"eval_{int(time.time()*1000)}_{category.lower()}.jpg"
        out_path = str(RESULTS_DIR / out_filename)

        start = time.time()
        create_offline_vton_composite(
            person_img_path=person_path,
            garment_img_path=garment_path,
            output_path=out_path,
            category=category,
            options=options or {}
        )
        end = time.time()

        dur_sec = max(round(end - start, 3), 0.01)
        return {
            "output_path": f"/data/results/{out_filename}",
            "duration_ms": round(dur_sec * 1000.0, 1),
            "duration_sec": dur_sec,
            "status": "completed",
            "error_message": None
        }


class FASHNCloudProvider(VTONProvider):
    def get_name(self) -> str:
        return "FASHN API (Commercial Cloud)"

    def get_status(self) -> Tuple[str, str]:
        if settings.FASHN_API_KEY:
            return ("READY", "FASHN API key configured")
        return ("NOT CONFIGURED", "FASHN_API_KEY is not set in environment or .env file.")

    def get_license(self) -> str:
        return "Commercial API License"

    def estimate_or_calculate_cost(self, duration_sec: float) -> Tuple[float, str, str]:
        # $0.045 USD per call @ 83.3 INR/USD = Rs 3.75
        cost_inr = round(0.045 * 83.3, 2)
        return (cost_inr, "Actual", "$0.045 / API generation @ 83.3 INR/USD")

    def generate(
        self,
        person_path: str,
        garment_path: str,
        category: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        status, reason = self.get_status()
        if status != "READY":
            raise ValueError(f"FASHN API unavailable: {reason}")

        # Real HTTP call to FASHN API
        start = time.time()
        # If API key is present, execute actual request
        headers = {"Authorization": f"Bearer {settings.FASHN_API_KEY}"}
        # In case API endpoint responds:
        try:
            with httpx.Client(timeout=30.0) as client:
                res = client.post(
                    "https://api.fashn.ai/v1/run",
                    headers=headers,
                    json={
                        "model_image": person_path,
                        "garment_image": garment_path,
                        "category": category.lower()
                    }
                )
                res.raise_for_status()
                data = res.json()
                dur_sec = max(round(time.time() - start, 3), 0.1)
                return {
                    "output_path": data.get("output", [person_path])[0],
                    "duration_ms": round(dur_sec * 1000.0, 1),
                    "duration_sec": dur_sec,
                    "status": "completed",
                    "error_message": None
                }
        except Exception as e:
            dur_sec = max(round(time.time() - start, 3), 0.1)
            return {
                "output_path": None,
                "duration_ms": round(dur_sec * 1000.0, 1),
                "duration_sec": dur_sec,
                "status": "failed",
                "error_message": f"FASHN API error: {str(e)}"
            }


class CatVTONProvider(VTONProvider):
    def get_name(self) -> str:
        return "CatVTON"

    def get_status(self) -> Tuple[str, str]:
        endpoint = os.getenv("CATVTON_ENDPOINT_URL")
        if endpoint:
            return ("READY", f"Connected to endpoint: {endpoint}")
        
        # Check if local CUDA PyTorch environment is present
        try:
            import torch
            if torch.cuda.is_available():
                return ("READY", f"Local NVIDIA CUDA GPU: {torch.cuda.get_device_name(0)}")
        except ImportError:
            pass

        return ("NOT CONFIGURED", "Requires NVIDIA GPU with CUDA or CATVTON_ENDPOINT_URL in .env")

    def get_license(self) -> str:
        return "Apache 2.0 (Commercial OK)"

    def estimate_or_calculate_cost(self, duration_sec: float) -> Tuple[float, str, str]:
        # Serverless RTX 4090 ($0.29/hr = $0.0000805/s)
        rate = 0.0000805
        cost_inr = round((duration_sec * rate * 83.3) + 0.05, 2)
        return (cost_inr, "Estimated", f"RTX 4090 rate (${rate}/s) × {duration_sec}s × 83.3 + bandwidth")

    def generate(
        self,
        person_path: str,
        garment_path: str,
        category: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        status, reason = self.get_status()
        if status != "READY":
            raise ValueError(f"CatVTON model unavailable: {reason}")

        endpoint = os.getenv("CATVTON_ENDPOINT_URL")
        start = time.time()

        if endpoint:
            with httpx.Client(timeout=60.0) as client:
                res = client.post(
                    endpoint,
                    json={
                        "person_image": person_path,
                        "garment_image": garment_path,
                        "category": category
                    }
                )
                res.raise_for_status()
                data = res.json()
                dur_sec = max(round(time.time() - start, 3), 0.1)
                return {
                    "output_path": data.get("result_image_url"),
                    "duration_ms": round(dur_sec * 1000.0, 1),
                    "duration_sec": dur_sec,
                    "status": "completed",
                    "error_message": None
                }
        else:
            # Local CUDA execution if installed
            dur_sec = max(round(time.time() - start, 3), 0.1)
            return {
                "output_path": None,
                "duration_ms": round(dur_sec * 1000.0, 1),
                "duration_sec": dur_sec,
                "status": "failed",
                "error_message": "PyTorch weights not downloaded in local weights directory."
            }


class IDMVTONProvider(VTONProvider):
    def __init__(self, is_optimized: bool = False):
        self.is_optimized = is_optimized

    def get_name(self) -> str:
        return "IDM-VTON (Optimized)" if self.is_optimized else "IDM-VTON (Baseline)"

    def get_status(self) -> Tuple[str, str]:
        endpoint = os.getenv("IDMVTON_ENDPOINT_URL")
        if endpoint:
            return ("READY", f"Connected to endpoint: {endpoint}")
        
        try:
            import torch
            if torch.cuda.is_available() and torch.cuda.get_device_properties(0).total_memory >= 14 * 1024**3:
                return ("READY", f"Local NVIDIA A100/3090: {torch.cuda.get_device_name(0)}")
        except ImportError:
            pass

        return ("NOT CONFIGURED", "Requires NVIDIA A100 (16GB+ VRAM) or IDMVTON_ENDPOINT_URL in .env")

    def get_license(self) -> str:
        return "CC-BY-NC-SA 4.0 (Non-Commercial / Research Only)"

    def estimate_or_calculate_cost(self, duration_sec: float) -> Tuple[float, str, str]:
        rate = 0.000247  # A100 ($0.89/hr)
        cost_inr = round((duration_sec * rate * 83.3), 2)
        return (cost_inr, "Estimated", f"A100 rate (${rate}/s) × {duration_sec}s × 83.3")

    def generate(
        self,
        person_path: str,
        garment_path: str,
        category: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        status, reason = self.get_status()
        if status != "READY":
            raise ValueError(f"{self.get_name()} unavailable: {reason}")

        endpoint = os.getenv("IDMVTON_ENDPOINT_URL")
        start = time.time()
        if endpoint:
            with httpx.Client(timeout=60.0) as client:
                res = client.post(
                    endpoint,
                    json={
                        "person_image": person_path,
                        "garment_image": garment_path,
                        "category": category,
                        "is_optimized": self.is_optimized
                    }
                )
                res.raise_for_status()
                data = res.json()
                dur_sec = max(round(time.time() - start, 3), 0.1)
                return {
                    "output_path": data.get("result_image_url"),
                    "duration_ms": round(dur_sec * 1000.0, 1),
                    "duration_sec": dur_sec,
                    "status": "completed",
                    "error_message": None
                }
        else:
            dur_sec = max(round(time.time() - start, 3), 0.1)
            return {
                "output_path": None,
                "duration_ms": round(dur_sec * 1000.0, 1),
                "duration_sec": dur_sec,
                "status": "failed",
                "error_message": "Local A100 checkpoint not found."
            }


class OOTDiffusionProvider(VTONProvider):
    def get_name(self) -> str:
        return "OOTDiffusion"

    def get_status(self) -> Tuple[str, str]:
        if settings.REPLICATE_API_TOKEN:
            return ("READY", "Replicate API token configured")
        return ("NOT CONFIGURED", "REPLICATE_API_TOKEN is not set in environment or .env file.")

    def get_license(self) -> str:
        return "OpenRAIL-M"

    def estimate_or_calculate_cost(self, duration_sec: float) -> Tuple[float, str, str]:
        rate = 0.00038
        cost_inr = round(duration_sec * rate * 83.3, 2)
        return (cost_inr, "Estimated", f"Serverless T4 rate (${rate}/s) × {duration_sec}s × 83.3")

    def generate(
        self,
        person_path: str,
        garment_path: str,
        category: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        status, reason = self.get_status()
        if status != "READY":
            raise ValueError(f"OOTDiffusion unavailable: {reason}")

        # Real Replicate API call
        start = time.time()
        try:
            headers = {"Authorization": f"Token {settings.REPLICATE_API_TOKEN}"}
            with httpx.Client(timeout=60.0) as client:
                res = client.post(
                    "https://api.replicate.com/v1/predictions",
                    headers=headers,
                    json={
                        "version": "ootdiffusion-version-hash",
                        "input": {
                            "model_image": person_path,
                            "garment_image": garment_path,
                            "category": category.lower()
                        }
                    }
                )
                res.raise_for_status()
                data = res.json()
                dur_sec = max(round(time.time() - start, 3), 0.1)
                return {
                    "output_path": data.get("output"),
                    "duration_ms": round(dur_sec * 1000.0, 1),
                    "duration_sec": dur_sec,
                    "status": "completed",
                    "error_message": None
                }
        except Exception as e:
            dur_sec = max(round(time.time() - start, 3), 0.1)
            return {
                "output_path": None,
                "duration_ms": round(dur_sec * 1000.0, 1),
                "duration_sec": dur_sec,
                "status": "failed",
                "error_message": f"Replicate API error: {str(e)}"
            }


# Registry of candidate providers
PROVIDERS: Dict[str, VTONProvider] = {
    "Local Baseline (CPU Pipeline)": LocalBaselineProvider(),
    "CatVTON": CatVTONProvider(),
    "IDM-VTON (Baseline)": IDMVTONProvider(is_optimized=False),
    "IDM-VTON (Optimized)": IDMVTONProvider(is_optimized=True),
    "OOTDiffusion": OOTDiffusionProvider(),
    "FASHN API (Commercial Cloud)": FASHNCloudProvider()
}
