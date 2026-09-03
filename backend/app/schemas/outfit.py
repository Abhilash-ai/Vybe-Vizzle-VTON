from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from .garment import GarmentResponse


class OutfitCreate(BaseModel):
    title: str = "My Curated Outfit"
    description: Optional[str] = None
    garment_ids: List[str]
    preview_image_url: Optional[str] = None


class OutfitResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    garment_ids: List[str]
    garments: Optional[List[GarmentResponse]] = None
    preview_image_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
