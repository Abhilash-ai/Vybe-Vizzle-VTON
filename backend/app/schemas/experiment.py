from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class RunEvaluationRequest(BaseModel):
    model_name: str = "CatVTON"  # CatVTON, IDM-VTON, OOTDiffusion, FASHN
    category: str = "Saree"      # Saree, Kurti, Lehenga, Top, T-shirt, Jumpsuit, Coat, Shirt, Jeans, Trousers
    person_image_url: str
    garment_image_url: str
    garment_name: Optional[str] = None
    is_optimized: bool = False
    optimization_technique: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = Field(default_factory=dict)


class EvaluationScoreUpdate(BaseModel):
    fit_score: float = Field(..., ge=0.0, le=4.0, description="Garment Fit (0-4)")
    drape_score: float = Field(..., ge=0.0, le=4.0, description="Garment Drape & Flow (0-4)")
    texture_score: float = Field(..., ge=0.0, le=4.0, description="Texture Fidelity (0-4)")
    artifact_score: float = Field(..., ge=0.0, le=4.0, description="Minimal Artifacts (0-4)")
    face_score: float = Field(..., ge=0.0, le=4.0, description="Face & Identity Preservation (0-4)")
    body_score: float = Field(..., ge=0.0, le=4.0, description="Body Shape & Pose Preservation (0-4)")
    notes: Optional[str] = None


class ExperimentResponse(BaseModel):
    id: str
    created_at: datetime
    model_name: str
    provider: str
    category: str
    person_image_url: str
    garment_image_url: str
    garment_name: Optional[str] = None
    result_image_url: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    generation_time_sec: float
    cost_inr: float
    meets_time_req: bool
    meets_cost_req: bool
    fit_score: Optional[float] = None
    drape_score: Optional[float] = None
    texture_score: Optional[float] = None
    artifact_score: Optional[float] = None
    face_score: Optional[float] = None
    body_score: Optional[float] = None
    overall_score: Optional[float] = None
    meets_accuracy_req: Optional[bool] = None
    is_optimized: bool
    optimization_technique: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MatrixCell(BaseModel):
    model_name: str
    category: str
    experiment_id: Optional[str] = None
    generation_time_sec: Optional[float] = None
    cost_inr: Optional[float] = None
    accuracy_score: Optional[float] = None
    meets_all_reqs: Optional[bool] = None
    result_image_url: Optional[str] = None
    tested: bool = False


class BenchmarkMatrixResponse(BaseModel):
    categories: List[str]
    models: List[str]
    matrix: Dict[str, Dict[str, MatrixCell]]  # model -> category -> cell
    summary_rankings: List[Dict[str, Any]]
