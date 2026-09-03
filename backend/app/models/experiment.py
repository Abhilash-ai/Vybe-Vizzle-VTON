import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Integer, Boolean, Text, JSON
from ..database import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Model & Provider
    model_name = Column(String(100), nullable=False)
    provider_type = Column(String(50), nullable=False)
    provider_status = Column(String(50), default="CONNECTED")
    
    # Inputs & Category
    category = Column(String(50), nullable=False)  # Saree, Kurti, Lehenga, Top, T-shirt, Jumpsuit, Coat, Shirt, Jeans, Trousers
    person_image_path = Column(String(512), nullable=False)
    garment_image_path = Column(String(512), nullable=False)
    garment_name = Column(String(255), nullable=True)
    configuration = Column(JSON, nullable=True)
    
    # Execution Lifecycle & Timing (Measured)
    generation_status = Column(String(50), default="completed")  # completed, failed, error
    error_message = Column(Text, nullable=True)
    start_time = Column(Float, nullable=True)
    end_time = Column(Float, nullable=True)
    duration_ms = Column(Float, nullable=False)            # Real measured duration in milliseconds
    generation_time_sec = Column(Float, nullable=False)    # duration_ms / 1000.0
    
    # Unit Economics (INR)
    cost_inr = Column(Float, nullable=False)
    cost_type = Column(String(20), default="Estimated")   # Actual | Estimated | Unknown
    cost_calculation_basis = Column(String(255), nullable=True)
    
    # Hard Requirement Evaluation Flags (Calculated only on actual measured values)
    meets_time_req = Column(Boolean, default=False)        # generation_time_sec < 15.0
    meets_cost_req = Column(Boolean, default=False)        # cost_inr < 4.0
    
    # Human Evaluation Scoring Rubric (0 = Failed, 1 = Poor, 2 = Acceptable, 3 = Good, 4 = Excellent)
    # These remain NULL until human evaluator inputs them!
    fit_score = Column(Float, nullable=True)
    drape_score = Column(Float, nullable=True)
    texture_score = Column(Float, nullable=True)
    pose_preservation_score = Column(Float, nullable=True)
    body_preservation_score = Column(Float, nullable=True)
    face_preservation_score = Column(Float, nullable=True)
    artifact_score = Column(Float, nullable=True)
    overall_score = Column(Float, nullable=True)          # (fit+drape+texture+pose+body+face+artifact)/7
    is_evaluated = Column(Boolean, default=False)
    evaluator_notes = Column(Text, nullable=True)
    
    # Outputs
    result_image_url = Column(String(512), nullable=True)
    
    # Optimization Tracking
    is_optimized = Column(Boolean, default=False)
    optimization_technique = Column(String(255), nullable=True)
    optimization_parameters = Column(JSON, nullable=True)
