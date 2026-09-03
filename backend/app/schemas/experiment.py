from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class RunEvaluationRequest(BaseModel):
    model_name: str = "CatVTON"  # CatVTON, IDM-VTON (Baseline), IDM-VTON (Optimized), OOTDiffusion, FASHN API (Commercial), Local Baseline
    category: str = "Saree"      # Saree, Kurti, Lehenga, Top, T-shirt, Jumpsuit, Coat, Shirt, Jeans, Trousers
    person_image_url: str
    garment_image_url: str
    garment_name: Optional[str] = None
    is_optimized: bool = False
    optimization_technique: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = Field(default_factory=dict)


class EvaluationScoreSubmission(BaseModel):
    fit_score: float = Field(..., ge=0.0, le=4.0, description="Garment Fit (0-4)")
    drape_score: float = Field(..., ge=0.0, le=4.0, description="Garment Drape & Flow (0-4)")
    texture_score: float = Field(..., ge=0.0, le=4.0, description="Texture Fidelity (0-4)")
    pose_preservation_score: float = Field(..., ge=0.0, le=4.0, description="Pose Preservation (0-4)")
    body_preservation_score: float = Field(..., ge=0.0, le=4.0, description="Body Shape Preservation (0-4)")
    face_preservation_score: float = Field(..., ge=0.0, le=4.0, description="Face & Identity Preservation (0-4)")
    artifact_score: float = Field(..., ge=0.0, le=4.0, description="Artifact Quality (4=zero artifacts, 0=severe artifacts)")
    evaluator_notes: Optional[str] = None


class ExperimentResponse(BaseModel):
    id: str
    timestamp: datetime
    model_name: str
    provider_type: str
    provider_status: str
    category: str
    person_image_path: str
    garment_image_path: str
    garment_name: Optional[str] = None
    result_image_url: Optional[str] = None
    generation_status: str
    error_message: Optional[str] = None
    duration_ms: float
    generation_time_sec: float
    cost_inr: float
    cost_type: str
    cost_calculation_basis: Optional[str] = None
    meets_time_req: bool
    meets_cost_req: bool
    fit_score: Optional[float] = None
    drape_score: Optional[float] = None
    texture_score: Optional[float] = None
    pose_preservation_score: Optional[float] = None
    body_preservation_score: Optional[float] = None
    face_preservation_score: Optional[float] = None
    artifact_score: Optional[float] = None
    overall_score: Optional[float] = None
    is_evaluated: bool
    evaluator_notes: Optional[str] = None
    is_optimized: bool
    optimization_technique: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MatrixCellResponse(BaseModel):
    model_name: str
    category: str
    experiment_id: Optional[str] = None
    generation_time_sec: Optional[float] = None
    cost_inr: Optional[float] = None
    cost_type: Optional[str] = None
    accuracy_score: Optional[float] = None
    meets_all_reqs: Optional[bool] = None
    result_image_url: Optional[str] = None
    is_evaluated: bool = False
    tested: bool = False


class SummaryRankingItem(BaseModel):
    model: str
    tests_completed: int
    avg_accuracy_score: Optional[float] = None
    avg_generation_time_sec: Optional[float] = None
    avg_cost_inr: Optional[float] = None
    cost_type: str
    categories_passed: str
    passed_count: int
    license: str
    meets_time_constraint: bool
    meets_cost_constraint: bool
    production_verdict: str  # "RECOMMENDED" | "NOT PRODUCTION-READY" | "INSUFFICIENT DATA" | "NON-COMMERCIAL"


class BenchmarkMatrixResponse(BaseModel):
    categories: List[str]
    models: List[str]
    total_experiments_recorded: int
    matrix: Dict[str, Dict[str, MatrixCellResponse]]
    summary_rankings: List[SummaryRankingItem]
    has_data: bool


class ManifestValidationItem(BaseModel):
    test_id: str
    category: str
    person_image: str
    garment_image: str
    garment_name: str
    description: str
    person_exists: bool
    garment_exists: bool
    is_valid: bool


class DatasetValidationResponse(BaseModel):
    total_test_cases: int
    valid_test_cases: int
    missing_test_cases: int
    dataset_status: str
    items: List[ManifestValidationItem]


class ProviderStatusInfo(BaseModel):
    model_name: str
    provider_type: str
    status: str  # "CONNECTED" | "NOT CONFIGURED" | "UNAVAILABLE"
    license: str
    is_commercial_safe: bool
    architecture: str
    pricing_model: str
    environment_note: str
    experiments_recorded: int
