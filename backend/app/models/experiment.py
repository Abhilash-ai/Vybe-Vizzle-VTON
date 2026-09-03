import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Integer, Boolean, Text, JSON
from ..database import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Model & Provider
    model_name = Column(String(100), nullable=False)  # CatVTON, IDM-VTON, OOTDiffusion, FASHN, etc.
    provider = Column(String(50), nullable=False)      # self-hosted, cloud-api, local-eval
    
    # Inputs & Category
    category = Column(String(50), nullable=False)     # Saree, Kurti, Lehenga, Top, T-shirt, Jumpsuit, Coat, Shirt, Jeans, Trousers
    person_image_url = Column(String(512), nullable=False)
    garment_image_url = Column(String(512), nullable=False)
    garment_name = Column(String(255), nullable=True)
    configuration = Column(JSON, nullable=True)
    
    # Outputs
    result_image_url = Column(String(512), nullable=True)
    status = Column(String(50), default="completed")  # completed, failed
    error_message = Column(Text, nullable=True)
    
    # Performance & Economics (Hard Requirements)
    generation_time_sec = Column(Float, nullable=False)   # Target: < 15.0s
    cost_inr = Column(Float, nullable=False)              # Target: < Rs 4.0
    meets_time_req = Column(Boolean, default=True)        # generation_time_sec < 15.0
    meets_cost_req = Column(Boolean, default=True)        # cost_inr < 4.0
    
    # Accuracy Scoring Rubric (0 = failed, 1 = poor, 2 = acceptable, 3 = good, 4 = excellent)
    fit_score = Column(Float, nullable=True)
    drape_score = Column(Float, nullable=True)
    texture_score = Column(Float, nullable=True)
    artifact_score = Column(Float, nullable=True)
    face_score = Column(Float, nullable=True)
    body_score = Column(Float, nullable=True)
    overall_score = Column(Float, nullable=True)
    meets_accuracy_req = Column(Boolean, nullable=True)
    
    # Optimization Tracking
    is_optimized = Column(Boolean, default=False)
    optimization_technique = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
