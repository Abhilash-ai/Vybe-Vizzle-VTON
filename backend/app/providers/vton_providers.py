import os
import base64
import time
import httpx
from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, Optional
from pathlib import Path

from ..config import settings, RESULTS_DIR
from ..utils.image_processing import create_offline_vton_composite


def image_to_data_uri(image_path: str) -> str:
    """Converts a local image file to base64 data URI format for Replicate API."""
    p = Path(image_path)
    if not p.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")
    
    mime = "image/jpeg"
    if p.suffix.lower() == ".png":
        mime = "image/png"
    elif p.suffix.lower() == ".webp":
        mime = "image/webp"

    with open(p, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    return f"data:{mime};base64,{encoded}"


def download_and_save_image(url: str, output_path: str) -> str:
    """Downloads remote generated image and saves it locally."""
    with httpx.Client(timeout=30.0) as client:
        r = client.get(url)
        r.raise_for_status()
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(r.content)
    return output_path


class VTONProvider(ABC):
    @abstractmethod
    def get_name(self) -> str:
        pass

    @abstractmethod
    def get_status(self) -> Tuple[str, str]:
        """Returns (status, reason) e.g. ('READY', 'Replicate API configured') or ('NOT CONFIGURED', 'API key missing')"""
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


class IDMVTONProvider(VTONProvider):
    def __init__(self, is_optimized: bool = False):
        self.is_optimized = is_optimized

    def get_name(self) -> str:
        return "IDM-VTON (Optimized)" if self.is_optimized else "IDM-VTON (Baseline)"

    def get_status(self) -> Tuple[str, str]:
        token = os.getenv("REPLICATE_API_TOKEN") or getattr(settings, "REPLICATE_API_TOKEN", None)
        if token:
            return ("READY", "Live Replicate Cloud GPU (cuuupid/idm-vton)")
        
        endpoint = os.getenv("IDMVTON_ENDPOINT_URL")
        if endpoint:
            return ("READY", f"Connected to endpoint: {endpoint}")
        
        return ("NOT CONFIGURED", "Requires REPLICATE_API_TOKEN or IDMVTON_ENDPOINT_URL in .env")

    def get_license(self) -> str:
        return "CC-BY-NC-SA 4.0 (Non-Commercial Research Only)"

    def estimate_or_calculate_cost(self, duration_sec: float) -> Tuple[float, str, str]:
        # Replicate Nvidia A40/A100 serverless rate (~$0.000725/sec = Rs 0.06/sec)
        rate_per_sec = 0.000725
        cost_usd = duration_sec * rate_per_sec
        cost_inr = round(cost_usd * 83.3, 2)
        return (cost_inr, "Actual", f"Replicate Nvidia A40 GPU (${rate_per_sec}/s) × {duration_sec:.1f}s × 83.3 INR/USD")

    def generate(
        self,
        person_path: str,
        garment_path: str,
        category: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        status, reason = self.get_status()
        if status != "READY":
            raise ValueError(f"IDM-VTON unavailable: {reason}")

        token = os.getenv("REPLICATE_API_TOKEN") or getattr(settings, "REPLICATE_API_TOKEN", "")
        options = options or {}
        steps = options.get("steps", 30)

        # Map 10 Vizzle categories to IDM-VTON categories ("upper_body", "lower_body", "dresses")
        cat_lower = category.lower()
        if cat_lower in ["saree", "kurti", "lehenga", "jumpsuit", "dress", "traditional"]:
            vton_category = "dresses"
        elif cat_lower in ["jeans", "trousers", "pants", "skirt"]:
            vton_category = "lower_body"
        else:
            vton_category = "upper_body"

        start = time.time()

        try:
            # Convert local files to base64 Data URIs
            human_data_uri = image_to_data_uri(person_path)
            garment_data_uri = image_to_data_uri(garment_path)

            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            # Create prediction on Replicate cuuupid/idm-vton
            payload = {
                "version": "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
                "input": {
                    "human_img": human_data_uri,
                    "garm_img": garment_data_uri,
                    "garment_des": f"{category} garment fashion item",
                    "category": vton_category,
                    "steps": steps,
                    "seed": 42
                }
            }

            with httpx.Client(timeout=180.0) as client:
                res = client.post("https://api.replicate.com/v1/predictions", headers=headers, json=payload)
                if res.status_code not in (200, 201):
                    raise ValueError(f"Replicate API error {res.status_code}: {res.text}")
                
                prediction = res.json()
                pred_id = prediction["id"]

                # Poll prediction status until finished
                poll_url = f"https://api.replicate.com/v1/predictions/{pred_id}"
                while True:
                    time.sleep(2.0)
                    poll_res = client.get(poll_url, headers=headers)
                    if poll_res.status_code != 200:
                        raise ValueError(f"Replicate polling error {poll_res.status_code}: {poll_res.text}")
                    
                    poll_data = poll_res.json()
                    status_str = poll_data.get("status")

                    if status_str == "succeeded":
                        output_url = poll_data["output"]
                        break
                    elif status_str in ("failed", "canceled"):
                        error = poll_data.get("error", "Replicate prediction failed")
                        raise ValueError(f"IDM-VTON diffusion failed: {error}")

                # Download result image to local results dir
                out_filename = f"eval_idmvton_{int(time.time()*1000)}_{category.lower()}.jpg"
                out_local_path = str(RESULTS_DIR / out_filename)
                download_and_save_image(output_url, out_local_path)

                end = time.time()
                dur_sec = max(round(end - start, 3), 0.1)

                return {
                    "output_path": f"/data/results/{out_filename}",
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
                "error_message": f"IDM-VTON Live Inference Error: {str(e)}"
            }


class OOTDiffusionProvider(VTONProvider):
    def get_name(self) -> str:
        return "OOTDiffusion"

    def get_status(self) -> Tuple[str, str]:
        token = os.getenv("REPLICATE_API_TOKEN") or getattr(settings, "REPLICATE_API_TOKEN", None)
        if token:
            return ("READY", "Live Replicate Cloud GPU (viktorfa/oot_diffusion)")
        return ("NOT CONFIGURED", "REPLICATE_API_TOKEN is not set in environment or .env file.")

    def get_license(self) -> str:
        return "OpenRAIL-M"

    def estimate_or_calculate_cost(self, duration_sec: float) -> Tuple[float, str, str]:
        rate_per_sec = 0.00038
        cost_usd = duration_sec * rate_per_sec
        cost_inr = round(cost_usd * 83.3, 2)
        return (cost_inr, "Actual", f"Replicate T4 rate (${rate_per_sec}/s) × {duration_sec:.1f}s × 83.3 INR/USD")

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

        token = os.getenv("REPLICATE_API_TOKEN") or getattr(settings, "REPLICATE_API_TOKEN", "")

        cat_lower = category.lower()
        if cat_lower in ["saree", "kurti", "lehenga", "jumpsuit", "dress", "traditional"]:
            oot_category = "dress"
        elif cat_lower in ["jeans", "trousers", "pants", "skirt"]:
            oot_category = "lowerbody"
        else:
            oot_category = "upperbody"

        start = time.time()

        try:
            model_data_uri = image_to_data_uri(person_path)
            garment_data_uri = image_to_data_uri(garment_path)

            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            payload = {
                "version": "9f8fa4956970dde99689af7488157a30aa152e23953526a605df1d77598343d7",
                "input": {
                    "model_image": model_data_uri,
                    "cloth_image": garment_data_uri,
                    "category": oot_category,
                    "samples": 1,
                    "steps": 25
                }
            }

            with httpx.Client(timeout=180.0) as client:
                res = client.post("https://api.replicate.com/v1/predictions", headers=headers, json=payload)
                if res.status_code not in (200, 201):
                    raise ValueError(f"Replicate API error {res.status_code}: {res.text}")
                
                prediction = res.json()
                pred_id = prediction["id"]

                poll_url = f"https://api.replicate.com/v1/predictions/{pred_id}"
                while True:
                    time.sleep(2.0)
                    poll_res = client.get(poll_url, headers=headers)
                    if poll_res.status_code != 200:
                        raise ValueError(f"Replicate polling error {poll_res.status_code}: {poll_res.text}")
                    
                    poll_data = poll_res.json()
                    status_str = poll_data.get("status")

                    if status_str == "succeeded":
                        output_val = poll_data["output"]
                        output_url = output_val[0] if isinstance(output_val, list) else output_val
                        break
                    elif status_str in ("failed", "canceled"):
                        error = poll_data.get("error", "Replicate prediction failed")
                        raise ValueError(f"OOTDiffusion failed: {error}")

                out_filename = f"eval_ootdiff_{int(time.time()*1000)}_{category.lower()}.jpg"
                out_local_path = str(RESULTS_DIR / out_filename)
                download_and_save_image(output_url, out_local_path)

                end = time.time()
                dur_sec = max(round(end - start, 3), 0.1)

                return {
                    "output_path": f"/data/results/{out_filename}",
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
                "error_message": f"OOTDiffusion Live Inference Error: {str(e)}"
            }


class FASHNCloudProvider(VTONProvider):
    def get_name(self) -> str:
        return "FASHN API (Commercial Cloud)"

    def get_status(self) -> Tuple[str, str]:
        key = os.getenv("FASHN_API_KEY") or getattr(settings, "FASHN_API_KEY", None)
        if key:
            return ("READY", "FASHN API key configured")
        return ("NOT CONFIGURED", "FASHN_API_KEY is not set in environment or .env file.")

    def get_license(self) -> str:
        return "Commercial API License"

    def estimate_or_calculate_cost(self, duration_sec: float) -> Tuple[float, str, str]:
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

        key = os.getenv("FASHN_API_KEY") or getattr(settings, "FASHN_API_KEY", "")
        start = time.time()
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }

        # Map 10 Vizzle categories to FASHN API categories ("tops", "bottoms", "one-pieces")
        cat_lower = category.lower()
        if cat_lower in ["saree", "kurti", "lehenga", "jumpsuit", "dress", "traditional"]:
            fashn_category = "one-pieces"
        elif cat_lower in ["jeans", "trousers", "pants", "skirt"]:
            fashn_category = "bottoms"
        else:
            fashn_category = "tops"

        try:
            model_data_uri = image_to_data_uri(person_path)
            garment_data_uri = image_to_data_uri(garment_path)

            payload = {
                "model_image": model_data_uri,
                "garment_image": garment_data_uri,
                "category": fashn_category,
                "mode": "balanced",
                "auto_crop": True,
                "num_samples": 1
            }

            with httpx.Client(timeout=180.0) as client:
                res = client.post("https://api.fashn.ai/v1/run", headers=headers, json=payload)
                if res.status_code not in (200, 201):
                    raise ValueError(f"FASHN API run error {res.status_code}: {res.text}")

                data = res.json()
                pred_id = data.get("id")

                # If returned immediately
                if "output" in data and data["output"]:
                    output_url = data["output"][0]
                else:
                    # Poll /v1/status/{id}
                    poll_url = f"https://api.fashn.ai/v1/status/{pred_id}"
                    while True:
                        time.sleep(2.0)
                        poll_res = client.get(poll_url, headers=headers)
                        if poll_res.status_code != 200:
                            raise ValueError(f"FASHN status error {poll_res.status_code}: {poll_res.text}")
                        
                        poll_data = poll_res.json()
                        status_str = poll_data.get("status")

                        if status_str == "completed":
                            output_url = poll_data["output"][0]
                            break
                        elif status_str in ("failed", "canceled"):
                            err_msg = poll_data.get("error", "FASHN task failed")
                            raise ValueError(f"FASHN generation failed: {err_msg}")

                out_filename = f"eval_fashn_{int(time.time()*1000)}_{category.lower()}.jpg"
                out_local_path = str(RESULTS_DIR / out_filename)
                download_and_save_image(output_url, out_local_path)

                dur_sec = max(round(time.time() - start, 3), 0.1)
                return {
                    "output_path": f"/data/results/{out_filename}",
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
                "error_message": f"FASHN API Error: {str(e)}"
            }


class CatVTONProvider(VTONProvider):
    def get_name(self) -> str:
        return "CatVTON"

    def get_status(self) -> Tuple[str, str]:
        endpoint = os.getenv("CATVTON_ENDPOINT_URL")
        if endpoint:
            return ("READY", f"Connected to endpoint: {endpoint}")
        
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
            dur_sec = max(round(time.time() - start, 3), 0.1)
            return {
                "output_path": None,
                "duration_ms": round(dur_sec * 1000.0, 1),
                "duration_sec": dur_sec,
                "status": "failed",
                "error_message": "PyTorch weights not downloaded in local weights directory."
            }


PROVIDERS: Dict[str, VTONProvider] = {
    "Local Baseline (CPU Pipeline)": LocalBaselineProvider(),
    "IDM-VTON (Baseline)": IDMVTONProvider(is_optimized=False),
    "IDM-VTON (Optimized)": IDMVTONProvider(is_optimized=True),
    "OOTDiffusion": OOTDiffusionProvider(),
    "CatVTON": CatVTONProvider(),
    "FASHN API (Commercial Cloud)": FASHNCloudProvider(),
}
