from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class TryOnOptions(BaseModel):
    preserve_face: bool = True
    preserve_background: bool = True
    garment_fit: str = "regular"  # tight, regular, loose
    generation_quality: str = "high"  # standard, high, ultra
    seed: Optional[int] = None
    guidance_scale: Optional[float] = 2.5
    num_inference_steps: Optional[int] = 30


class TryOnRequest(BaseModel):
    person_image_url: str
    garment_image_url: str
    garment_category: str = "shirt"  # t-shirt, shirt, hoodie, jacket, dress, saree, kurta, pants, skirt, other
    garment_name: Optional[str] = "Selected Garment"
    provider: Optional[str] = None  # None -> use default from config, or specify demo, fashn, huggingface, replicate
    options: Optional[TryOnOptions] = Field(default_factory=TryOnOptions)


class TryOnJobResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    provider: str
    model_name: Optional[str] = None
    person_image_url: str
    garment_image_url: str
    garment_category: str
    status: str  # queued, processing, completed, failed
    progress: int
    current_step: str
    result_image_url: Optional[str] = None
    error_message: Optional[str] = None
    latency_ms: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
