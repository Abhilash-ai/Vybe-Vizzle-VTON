from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class BenchmarkModelComparison(BaseModel):
    provider: str
    model_name: str
    architecture: str
    license_type: str  # Research only, Commercial allowed, Proprietary API
    is_commercial_safe: bool
    status: str  # active, available_with_key, not_installed, offline_demo
    typical_latency_sec: str
    resolution: str
    vram_required_gb: Optional[float] = None
    estimated_cost_per_image: str
    garment_categories_supported: List[str]
    face_preservation_score: Optional[float] = None
    garment_alignment_score: Optional[float] = None
    environment_status_note: str


class SystemHardwareInfo(BaseModel):
    os: str
    python_version: str
    cpu_count: int
    torch_available: bool
    cuda_available: bool
    cuda_device_name: Optional[str] = None
    gpu_memory_gb: Optional[float] = None
    vton_provider_active: str
    demo_mode: bool


class BenchmarkHubResponse(BaseModel):
    system: SystemHardwareInfo
    models: List[BenchmarkModelComparison]
    recent_benchmark_logs: List[Dict[str, Any]]
