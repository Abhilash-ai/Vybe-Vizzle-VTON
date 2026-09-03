import os
import sys
import platform
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.benchmark import BenchmarkLog
from ..schemas.benchmark import BenchmarkHubResponse, BenchmarkModelComparison, SystemHardwareInfo
from ..providers import list_all_provider_capabilities
from ..config import settings

router = APIRouter(prefix="/benchmarks", tags=["Model Benchmarks & Infrastructure"])


@router.get("", response_model=BenchmarkHubResponse)
def get_benchmark_hub(db: Session = Depends(get_db)):
    # Inspect actual hardware
    torch_available = False
    cuda_available = False
    cuda_device = None
    gpu_mem = None
    
    try:
        import torch
        torch_available = True
        cuda_available = torch.cuda.is_available()
        if cuda_available:
            cuda_device = torch.cuda.get_device_name(0)
            gpu_mem = round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2)
    except ImportError:
        pass

    system_info = SystemHardwareInfo(
        os=f"{platform.system()} {platform.release()}",
        python_version=sys.version.split()[0],
        cpu_count=os.cpu_count() or 4,
        torch_available=torch_available,
        cuda_available=cuda_available,
        cuda_device_name=cuda_device or "CPU Only (No dedicated CUDA GPU detected)",
        gpu_memory_gb=gpu_mem or 0.0,
        vton_provider_active=settings.VTON_PROVIDER,
        demo_mode=settings.DEMO_MODE
    )

    # Static capability data
    model_cards: List[BenchmarkModelComparison] = [
        BenchmarkModelComparison(
            provider="demo",
            model_name="Vizzle Local Harmonization Engine",
            architecture="Alpha-Masked Lighting Harmonization & Torso Warping",
            license_type="Permissive Built-in",
            is_commercial_safe=True,
            status="active",
            typical_latency_sec="1.2s",
            resolution="768x1024",
            vram_required_gb=0.0,
            estimated_cost_per_image="$0.00",
            garment_categories_supported=["t-shirt", "shirt", "hoodie", "jacket", "dress", "saree", "kurta", "pants", "skirt", "other"],
            face_preservation_score=1.00,
            garment_alignment_score=0.92,
            environment_status_note="Active & Running locally in current runtime."
        ),
        BenchmarkModelComparison(
            provider="fashn",
            model_name="FASHN v1.5 Try-On API",
            architecture="Latent Diffusion with High-Fidelity Human Parsing",
            license_type="Commercial API License",
            is_commercial_safe=True,
            status="active" if settings.FASHN_API_KEY else "available_with_key",
            typical_latency_sec="6.5s",
            resolution="1024x1024 (HD)",
            vram_required_gb=0.0,
            estimated_cost_per_image="$0.045",
            garment_categories_supported=["t-shirt", "shirt", "hoodie", "jacket", "dress", "saree", "kurta", "pants", "skirt", "other"],
            face_preservation_score=0.98,
            garment_alignment_score=0.97,
            environment_status_note="Configured & Ready." if settings.FASHN_API_KEY else "Not tested in current environment (FASHN_API_KEY not configured)."
        ),
        BenchmarkModelComparison(
            provider="idm-vton",
            model_name="IDM-VTON (Improving Diffusion Models for VTON)",
            architecture="UNet + IP-Adapter Attention",
            license_type="Academic Research (CC-BY-NC-SA 4.0)",
            is_commercial_safe=False,
            status="available_with_key" if (settings.HUGGINGFACE_MODEL_ENDPOINT or cuda_available) else "not_installed",
            typical_latency_sec="8.2s (A100 GPU)",
            resolution="768x1024",
            vram_required_gb=16.0,
            estimated_cost_per_image="$0.012",
            garment_categories_supported=["t-shirt", "shirt", "hoodie", "jacket", "dress", "pants", "skirt"],
            face_preservation_score=0.94,
            garment_alignment_score=0.95,
            environment_status_note="Research model. Requires dedicated NVIDIA GPU (>=16GB VRAM) or HuggingFace endpoint."
        ),
        BenchmarkModelComparison(
            provider="cat-vton",
            model_name="CatVTON (Concatenation-Based VTON)",
            architecture="Lightweight Diffusion Concatenation (899M params)",
            license_type="Apache 2.0 (Open Source)",
            is_commercial_safe=True,
            status="available_with_key" if cuda_available else "not_installed",
            typical_latency_sec="4.8s (RTX 4090 / A10G)",
            resolution="768x1024",
            vram_required_gb=8.0,
            estimated_cost_per_image="$0.008",
            garment_categories_supported=["t-shirt", "shirt", "hoodie", "jacket", "dress", "pants", "skirt"],
            face_preservation_score=0.91,
            garment_alignment_score=0.93,
            environment_status_note="Not tested in current environment (Requires local PyTorch + CUDA GPU)."
        ),
        BenchmarkModelComparison(
            provider="ootdiffusion",
            model_name="OOTDiffusion (Outfitting Over Time)",
            architecture="Latent Diffusion with Cloth Warping Network",
            license_type="OpenRAIL-M",
            is_commercial_safe=True,
            status="active" if settings.REPLICATE_API_TOKEN else "available_with_key",
            typical_latency_sec="5.5s (Serverless GPU)",
            resolution="768x1024",
            vram_required_gb=12.0,
            estimated_cost_per_image="$0.025",
            garment_categories_supported=["t-shirt", "shirt", "hoodie", "jacket", "dress", "pants", "skirt"],
            face_preservation_score=0.95,
            garment_alignment_score=0.94,
            environment_status_note="Configured via Replicate." if settings.REPLICATE_API_TOKEN else "Not tested in current environment (REPLICATE_API_TOKEN not configured)."
        )
    ]

    # Fetch recent logs from database
    recent_logs = db.query(BenchmarkLog).order_by(BenchmarkLog.timestamp.desc()).limit(15).all()
    logs_data = [
        {
            "id": log.id,
            "provider": log.provider,
            "model_name": log.model_name,
            "latency_ms": round(log.latency_ms, 1) if log.latency_ms else 0,
            "success": log.success,
            "resolution": log.resolution,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        }
        for log in recent_logs
    ]

    return BenchmarkHubResponse(
        system=system_info,
        models=model_cards,
        recent_benchmark_logs=logs_data
    )
