import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from ..database import Base


class Garment(Base):
    __tablename__ = "garments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # t-shirt, shirt, hoodie, jacket, dress, saree, kurta, pants, skirt, other
    sub_category = Column(String(50), nullable=True)  # upper_body, lower_body, full_body, outerwear, traditional
    color = Column(String(50), nullable=True)
    brand = Column(String(100), nullable=True)
    image_url = Column(String(512), nullable=False)
    thumbnail_url = Column(String(512), nullable=True)
    description = Column(Text, nullable=True)
    is_sample = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="garments")
