from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class GarmentBase(BaseModel):
    name: str
    category: str  # t-shirt, shirt, hoodie, jacket, dress, saree, kurta, pants, skirt, other
    sub_category: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None


class GarmentCreate(GarmentBase):
    image_url: str
    thumbnail_url: Optional[str] = None
    is_sample: Optional[bool] = False


class GarmentResponse(GarmentBase):
    id: str
    user_id: Optional[str] = None
    image_url: str
    thumbnail_url: Optional[str] = None
    is_sample: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
