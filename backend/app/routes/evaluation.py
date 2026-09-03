import os
import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.experiment import Experiment
from ..schemas.experiment import (
    RunEvaluationRequest,
    EvaluationScoreSubmission,
    ExperimentResponse,
    BenchmarkMatrixResponse,
    DatasetValidationResponse,
    ProviderStatusInfo
)
from ..services.evaluation_service import eval_service, REQUIRED_CATEGORIES

router = APIRouter(prefix="/eval", tags=["Model Evaluation Engine"])


@router.get("/providers", response_model=List[ProviderStatusInfo])
def get_providers_status(db: Session = Depends(get_db)):
    """Returns actual connectivity and configuration status for all candidate VTON models."""
    return eval_service.get_providers_status(db)


@router.get("/manifest", response_model=DatasetValidationResponse)
def get_validated_dataset_manifest():
    """Returns dataset manifest with live disk file validation (confirms actual image existence)."""
    return eval_service.validate_dataset_manifest()


@router.post("/run", response_model=ExperimentResponse)
def run_model_evaluation(
    req: RunEvaluationRequest,
    db: Session = Depends(get_db)
):
    """
    Executes actual model inference pipeline, measuring exact millisecond duration
    and calculating unit cost strictly from documented rates without fabrication.
    """
    try:
        exp = eval_service.run_actual_inference(
            db=db,
            model_name=req.model_name,
            category=req.category,
            person_image_url=req.person_image_url,
            garment_image_url=req.garment_image_url,
            garment_name=req.garment_name,
            is_optimized=req.is_optimized,
            optimization_technique=req.optimization_technique,
            configuration=req.configuration
        )
        return exp
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inference execution failed: {str(e)}")


@router.get("/experiments", response_model=List[ExperimentResponse])
def list_experiments(
    category: Optional[str] = None,
    model_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lists real logged experiments from the database."""
    query = db.query(Experiment)
    if category and category.lower() != "all":
        query = query.filter(Experiment.category.ilike(category))
    if model_name and model_name.lower() != "all":
        query = query.filter(Experiment.model_name.ilike(f"%{model_name}%"))
    return query.order_by(Experiment.timestamp.desc()).all()


@router.get("/experiments/{experiment_id}", response_model=ExperimentResponse)
def get_experiment_by_id(experiment_id: str, db: Session = Depends(get_db)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment record not found.")
    return exp


@router.post("/experiments/{experiment_id}/score", response_model=ExperimentResponse)
def update_human_evaluation_score(
    experiment_id: str,
    scores: EvaluationScoreSubmission,
    db: Session = Depends(get_db)
):
    """
    Records human evaluation observations across the 0-4 scoring rubric.
    Overall score is computed dynamically from the 7 rubric dimensions.
    """
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    exp.fit_score = scores.fit_score
    exp.drape_score = scores.drape_score
    exp.texture_score = scores.texture_score
    exp.pose_preservation_score = scores.pose_preservation_score
    exp.body_preservation_score = scores.body_preservation_score
    exp.face_preservation_score = scores.face_preservation_score
    exp.artifact_score = scores.artifact_score

    # Compute overall score from the 7 dimensions
    all_scores = [
        scores.fit_score,
        scores.drape_score,
        scores.texture_score,
        scores.pose_preservation_score,
        scores.body_preservation_score,
        scores.face_preservation_score,
        scores.artifact_score
    ]
    avg_score = round(sum(all_scores) / len(all_scores), 2)
    exp.overall_score = avg_score
    exp.is_evaluated = True
    if scores.evaluator_notes:
        exp.evaluator_notes = scores.evaluator_notes

    db.commit()
    db.refresh(exp)
    return exp


@router.get("/matrix", response_model=BenchmarkMatrixResponse)
def get_benchmark_matrix(db: Session = Depends(get_db)):
    """
    Returns the dynamic benchmark matrix populated ONLY with real recorded experiments.
    Un-run cells are explicitly returned as NOT TESTED.
    """
    return eval_service.build_benchmark_matrix(db)


@router.get("/optimization-report")
def get_optimization_report(db: Session = Depends(get_db)):
    """
    Returns comparative data for IDM-VTON baseline vs optimized.
    Only computes delta when real experiments exist for both.
    """
    return eval_service.get_optimization_comparison(db)


@router.post("/clear-all")
def clear_all_experiments(db: Session = Depends(get_db)):
    """Clears all logged experiment records from the database."""
    deleted_count = db.query(Experiment).delete()
    db.commit()
    return {"status": "cleared", "deleted_experiments_count": deleted_count}


@router.get("/export-csv")
def export_experiments_csv(db: Session = Depends(get_db)):
    """Exports all real recorded experiments and rubric evaluations to CSV."""
    experiments = db.query(Experiment).order_by(Experiment.timestamp.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Experiment ID", "Timestamp", "Model Name", "Provider Type", "Category", "Garment Name",
        "Measured Duration (sec)", "Measured Duration (ms)", "Unit Cost (INR)", "Cost Type", "Cost Calculation Basis",
        "Meets Time Req (<15s)", "Meets Cost Req (<Rs 4)", "Is Evaluated",
        "Fit Score (0-4)", "Drape Score (0-4)", "Texture Score (0-4)", "Pose Preservation (0-4)",
        "Body Preservation (0-4)", "Face Preservation (0-4)", "Artifact Score (0-4)", "Overall Score (0-4)",
        "Is Optimized", "Optimization Technique", "Evaluator Notes"
    ])

    for e in experiments:
        writer.writerow([
            e.id, e.timestamp.isoformat() if e.timestamp else "", e.model_name, e.provider_type, e.category, e.garment_name or "",
            e.generation_time_sec, e.duration_ms, e.cost_inr, e.cost_type, e.cost_calculation_basis or "",
            "YES" if e.meets_time_req else "NO", "YES" if e.meets_cost_req else "NO", "YES" if e.is_evaluated else "NO",
            e.fit_score if e.fit_score is not None else "",
            e.drape_score if e.drape_score is not None else "",
            e.texture_score if e.texture_score is not None else "",
            e.pose_preservation_score if e.pose_preservation_score is not None else "",
            e.body_preservation_score if e.body_preservation_score is not None else "",
            e.face_preservation_score if e.face_preservation_score is not None else "",
            e.artifact_score if e.artifact_score is not None else "",
            e.overall_score if e.overall_score is not None else "",
            "YES" if e.is_optimized else "NO",
            e.optimization_technique or "",
            e.evaluator_notes or ""
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vizzle_vton_empirical_experiments.csv"}
    )
