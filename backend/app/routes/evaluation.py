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
    EvaluationScoreUpdate,
    ExperimentResponse,
    BenchmarkMatrixResponse
)
from ..services.evaluation_service import eval_service, REQUIRED_CATEGORIES, CANDIDATE_MODELS

router = APIRouter(prefix="/eval", tags=["Model Evaluation Engine"])


@router.get("/manifest")
def get_test_manifest():
    """Returns the standardized 10-category benchmark dataset manifest."""
    manifest_path = eval_service.resolve_path("data/manifests/tests.csv")
    tests = []
    if os.path.exists(manifest_path):
        with open(manifest_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            tests = list(reader)
    return {
        "categories_count": len(REQUIRED_CATEGORIES),
        "required_categories": REQUIRED_CATEGORIES,
        "candidate_models": CANDIDATE_MODELS,
        "test_dataset": tests
    }


@router.post("/run", response_model=ExperimentResponse)
def run_model_evaluation(
    req: RunEvaluationRequest,
    db: Session = Depends(get_db)
):
    """Executes a standardized model try-on evaluation test."""
    exp = eval_service.run_evaluation(
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


@router.get("/experiments", response_model=List[ExperimentResponse])
def list_experiments(
    category: Optional[str] = None,
    model_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Experiment)
    if category and category.lower() != "all":
        query = query.filter(Experiment.category.ilike(category))
    if model_name and model_name.lower() != "all":
        query = query.filter(Experiment.model_name.ilike(f"%{model_name}%"))
    return query.order_by(Experiment.created_at.desc()).all()


@router.get("/experiments/{experiment_id}", response_model=ExperimentResponse)
def get_experiment_by_id(experiment_id: str, db: Session = Depends(get_db)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment record not found.")
    return exp


@router.post("/experiments/{experiment_id}/score", response_model=ExperimentResponse)
def update_human_evaluation_score(
    experiment_id: str,
    scores: EvaluationScoreUpdate,
    db: Session = Depends(get_db)
):
    """Updates the 0-4 accuracy scoring rubric for a specific experiment."""
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    exp.fit_score = scores.fit_score
    exp.drape_score = scores.drape_score
    exp.texture_score = scores.texture_score
    exp.artifact_score = scores.artifact_score
    exp.face_score = scores.face_score
    exp.body_score = scores.body_score

    # Compute weighted overall score
    avg_score = round((scores.fit_score + scores.drape_score + scores.texture_score + scores.artifact_score + scores.face_score + scores.body_score) / 6.0, 2)
    exp.overall_score = avg_score
    exp.meets_accuracy_req = avg_score >= 3.0
    if scores.notes:
        exp.notes = scores.notes

    db.commit()
    db.refresh(exp)
    return exp


@router.get("/matrix", response_model=BenchmarkMatrixResponse)
def get_benchmark_matrix(db: Session = Depends(get_db)):
    """Returns the full 10-category x Model evaluation matrix with summary rankings."""
    # Ensure suite is seeded if table is empty
    if db.query(Experiment).count() == 0:
        eval_service.seed_evaluation_benchmark_suite(db)
    return eval_service.build_benchmark_matrix(db)


@router.get("/optimization-report")
def get_optimization_report(db: Session = Depends(get_db)):
    """Returns the comparative study for IDM-VTON on ethnic categories (Saree, Kurti, Lehenga)."""
    if db.query(Experiment).count() == 0:
        eval_service.seed_evaluation_benchmark_suite(db)

    ethnic_cats = ["Saree", "Kurti", "Lehenga"]
    baseline_exps = db.query(Experiment).filter(
        Experiment.model_name == "IDM-VTON (Baseline)",
        Experiment.category.in_(ethnic_cats)
    ).all()
    optimized_exps = db.query(Experiment).filter(
        Experiment.model_name == "IDM-VTON (Optimized)",
        Experiment.category.in_(ethnic_cats)
    ).all()

    comparison = []
    for cat in ethnic_cats:
        base = next((e for e in baseline_exps if e.category == cat), None)
        opt = next((e for e in optimized_exps if e.category == cat), None)
        if base and opt:
            comparison.append({
                "category": cat,
                "baseline": {
                    "fit": base.fit_score,
                    "drape": base.drape_score,
                    "overall": base.overall_score,
                    "meets_accuracy": base.meets_accuracy_req,
                    "result_image_url": base.result_image_url,
                    "notes": base.notes
                },
                "optimized": {
                    "fit": opt.fit_score,
                    "drape": opt.drape_score,
                    "overall": opt.overall_score,
                    "meets_accuracy": opt.meets_accuracy_req,
                    "result_image_url": opt.result_image_url,
                    "notes": opt.notes,
                    "technique": opt.optimization_technique
                },
                "accuracy_improvement_pct": round(((opt.overall_score - base.overall_score) / base.overall_score) * 100, 1) if base.overall_score else 0.0
            })

    return {
        "title": "IDM-VTON Saree & Kurti Optimization Study",
        "problem_statement": "IDM-VTON fails on Saree and Kurti out of the box due to upper-body bounding assumptions cutting off continuous drapes and hems.",
        "solution_applied": "Adaptive semantic human parsing with full-body dilation, garment texture-guided mask expansion, and collar restoration.",
        "findings": comparison
    }


@router.get("/export-csv")
def export_experiments_csv(db: Session = Depends(get_db)):
    """Exports all recorded experiments and rubric evaluations to CSV."""
    experiments = db.query(Experiment).order_by(Experiment.created_at.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Experiment ID", "Date", "Model Name", "Provider", "Category", "Garment Name",
        "Generation Time (sec)", "Cost (INR)", "Meets Time Req (<15s)", "Meets Cost Req (<Rs 4)",
        "Fit Score (0-4)", "Drape Score (0-4)", "Texture Score (0-4)", "Artifact Score (0-4)",
        "Face Preservation (0-4)", "Body Preservation (0-4)", "Overall Score (0-4)",
        "Meets Accuracy Req", "Is Optimized", "Optimization Technique", "Notes"
    ])

    for e in experiments:
        writer.writerow([
            e.id, e.created_at.isoformat(), e.model_name, e.provider, e.category, e.garment_name or "",
            e.generation_time_sec, e.cost_inr, "YES" if e.meets_time_req else "NO", "YES" if e.meets_cost_req else "NO",
            e.fit_score or "", e.drape_score or "", e.texture_score or "", e.artifact_score or "",
            e.face_score or "", e.body_score or "", e.overall_score or "",
            "YES" if e.meets_accuracy_req else "NO", "YES" if e.is_optimized else "NO",
            e.optimization_technique or "", e.notes or ""
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vizzle_vton_model_evaluation_report.csv"}
    )
