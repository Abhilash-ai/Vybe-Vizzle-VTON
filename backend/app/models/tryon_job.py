import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text, JSON
from sqlalchemy.orm import relationship
from ..database import Base


class TryOnJob(Base):
    __tablename__ = "tryon_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    provider = Column(String(50), nullable=False, default="demo")  # demo, fashn, huggingface, replicate
    model_name = Column(String(100), nullable=True)
    
    person_image_url = Column(String(512), nullable=False)
    garment_image_url = Column(String(512), nullable=False)
    garment_category = Column(String(50), nullable=False)
    options = Column(JSON, nullable=True)  # preserve_face, preserve_bg, fit, quality, etc.
    
    status = Column(String(50), nullable=False, default="queued")  # queued, processing, completed, failed
    progress = Column(Integer, default=0)  # 0 to 100
    current_step = Column(String(255), default="Initializing")
    
    result_image_url = Column(String(512), nullable=True)
    error_message = Column(Text, nullable=True)
    latency_ms = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="tryon_jobs")
    look = relationship("GeneratedLook", back_populates="tryon_job", uselist=False)
