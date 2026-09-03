import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Float, Text
from sqlalchemy.orm import relationship
from ..database import Base


class GeneratedLook(Base):
    __tablename__ = "generated_looks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    tryon_job_id = Column(String(36), ForeignKey("tryon_jobs.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String(255), nullable=True, default="Virtual Try-On Look")
    person_image_url = Column(String(512), nullable=False)
    garment_image_url = Column(String(512), nullable=False)
    result_image_url = Column(String(512), nullable=False)
    
    garment_name = Column(String(255), nullable=True)
    garment_category = Column(String(50), nullable=True)
    provider = Column(String(50), nullable=True)
    generation_time_ms = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    is_favorite = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="looks")
    tryon_job = relationship("TryOnJob", back_populates="look")
