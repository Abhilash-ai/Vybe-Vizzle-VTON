from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class LookCreate(BaseModel):
    tryon_job_id: Optional[str] = None
    title: Optional[str] = "Virtual Try-On Look"
    person_image_url: str
    garment_image_url: str
    result_image_url: str
    garment_name: Optional[str] = None
    garment_category: Optional[str] = None
    provider: Optional[str] = None
    generation_time_ms: Optional[float] = None
    notes: Optional[str] = None
    is_favorite: Optional[bool] = False


class LookResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    tryon_job_id: Optional[str] = None
    title: Optional[str] = None
    person_image_url: str
    garment_image_url: str
    result_image_url: str
    garment_name: Optional[str] = None
    garment_category: Optional[str] = None
    provider: Optional[str] = None
    generation_time_ms: Optional[float] = None
    notes: Optional[str] = None
    is_favorite: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
