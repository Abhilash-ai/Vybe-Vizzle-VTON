import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Boolean, Text
from ..database import Base


class BenchmarkLog(Base):
    __tablename__ = "benchmark_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    provider = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    resolution = Column(String(50), default="768x1024")
    latency_ms = Column(Float, nullable=False)
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    vram_peak_mb = Column(Float, nullable=True)
    cost_estimate_usd = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
