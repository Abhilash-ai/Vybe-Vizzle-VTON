import os
import csv
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session

from ..config import DATA_DIR, RESULTS_DIR, SAMPLES_DIR, settings
from ..models.experiment import Experiment
from ..providers.vton_providers import PROVIDERS, VTONProvider
from ..schemas.experiment import (
    MatrixCellResponse,
    BenchmarkMatrixResponse,
    SummaryRankingItem,
    DatasetValidationResponse,
    ManifestValidationItem,
    ProviderStatusInfo
)

REQUIRED_CATEGORIES = [
    "Saree",
    "Kurti",
    "Lehenga",
    "Top",
    "T-shirt",
    "Jumpsuit",
    "Coat",
    "Shirt",
    "Jeans",
    "Trousers"
]


class EvaluationService:
    @staticmethod
    def resolve_path(url: str) -> str:
        clean = url.lstrip("/")
        if clean.startswith("data/"):
            return str(DATA_DIR / clean.replace("data/", "", 1))
        return url

    @staticmethod
    def get_providers_status(db: Session) -> List[ProviderStatusInfo]:
        results = []
        for name, provider in PROVIDERS.items():
            status, reason = provider.get_status()
            exp_count = db.query(Experiment).filter(Experiment.model_name == name).count()
            results.append(ProviderStatusInfo(
                model_name=name,
                provider_type="Cloud API" if "API" in name else ("Local CPU" if "CPU" in name else "GPU Self-Hosted"),
                status=status,
                license=provider.get_license(),
                is_commercial_safe="Commercial" in provider.get_license() or "Apache" in provider.get_license() or "MIT" in provider.get_license(),
                architecture="Latent Diffusion / Image Synthesis",
                pricing_model=reason,
                environment_note=f"{exp_count} experiments executed",
                experiments_recorded=exp_count
            ))
        return results

    @staticmethod
    def validate_dataset_manifest() -> DatasetValidationResponse:
        manifest_path = DATA_DIR / "manifests" / "tests.csv"
        if not manifest_path.exists():
            return DatasetValidationResponse(
                total_test_cases=0,
                valid_test_cases=0,
                missing_test_cases=0,
                dataset_status="MISSING_MANIFEST",
                items=[]
            )

        items = []
        valid_count = 0
        missing_count = 0

        with open(manifest_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                p_path = EvaluationService.resolve_path(row["person_image"])
                g_path = EvaluationService.resolve_path(row["garment_image"])

                p_exists = os.path.exists(p_path)
                g_exists = os.path.exists(g_path)
                is_valid = p_exists and g_exists

                if is_valid:
                    valid_count += 1
                else:
                    missing_count += 1

                items.append(ManifestValidationItem(
                    test_id=row.get("test_id", ""),
                    category=row.get("category", ""),
                    person_image=row.get("person_image", ""),
                    garment_image=row.get("garment_image", ""),
                    garment_name=row.get("garment_name", ""),
                    description=row.get("description", ""),
                    person_exists=p_exists,
                    garment_exists=g_exists,
                    is_valid=is_valid
                ))

        status_str = "FULLY_VALIDATED" if missing_count == 0 else f"{missing_count} ASSETS MISSING"
        return DatasetValidationResponse(
            total_test_cases=len(items),
            valid_test_cases=valid_count,
            missing_test_cases=missing_count,
            dataset_status=status_str,
            items=items
        )

    @staticmethod
    def run_actual_inference(
        db: Session,
        model_name: str,
        category: str,
        person_image_url: str,
        garment_image_url: str,
        garment_name: Optional[str] = None,
        is_optimized: bool = False,
        optimization_technique: Optional[str] = None,
        configuration: Optional[dict] = None
    ) -> Experiment:
        provider = PROVIDERS.get(model_name)
        if not provider:
            matched_key = next((k for k in PROVIDERS if model_name.lower() in k.lower()), None)
            if matched_key:
                provider = PROVIDERS[matched_key]
            else:
                raise ValueError(f"Unknown VTON model: {model_name}")

        status, reason = provider.get_status()
        if status != "READY":
            raise ValueError(f"Model '{model_name}' is unavailable: {reason}")

        person_path = EvaluationService.resolve_path(person_image_url)
        garment_path = EvaluationService.resolve_path(garment_image_url)

        if not os.path.exists(person_path):
            raise ValueError(f"Person image file not found: {person_image_url}")
        if not os.path.exists(garment_path):
            raise ValueError(f"Garment image file not found: {garment_image_url}")

        res = provider.generate(
            person_path=person_path,
            garment_path=garment_path,
            category=category,
            options={
                "is_optimized": is_optimized or ("Optimized" in model_name),
                "optimization_technique": optimization_technique
            }
        )

        if res["status"] != "completed" or not res["output_path"]:
            raise RuntimeError(f"Inference execution failed: {res.get('error_message', 'Unknown error')}")

        dur_sec = res["duration_sec"]
        dur_ms = res["duration_ms"]
        cost_inr, cost_type, cost_basis = provider.estimate_or_calculate_cost(dur_sec)

        meets_time = dur_sec < 15.0
        meets_cost = cost_inr < 4.0

        exp = Experiment(
            model_name=provider.get_name(),
            provider_type="Local Pipeline" if "CPU" in provider.get_name() else "Configured Endpoint",
            provider_status="CONNECTED",
            category=category,
            person_image_path=person_image_url,
            garment_image_path=garment_image_url,
            garment_name=garment_name or f"{category} Garment",
            configuration=configuration or {},
            generation_status="completed",
            start_time=time.time() - dur_sec,
            end_time=time.time(),
            duration_ms=dur_ms,
            generation_time_sec=dur_sec,
            cost_inr=cost_inr,
            cost_type=cost_type,
            cost_calculation_basis=cost_basis,
            meets_time_req=meets_time,
            meets_cost_req=meets_cost,
            result_image_url=res["output_path"],
            is_optimized=is_optimized or ("Optimized" in model_name),
            optimization_technique=optimization_technique,
            is_evaluated=False,
            fit_score=None,
            drape_score=None,
            texture_score=None,
            pose_preservation_score=None,
            body_preservation_score=None,
            face_preservation_score=None,
            artifact_score=None,
            overall_score=None,
            evaluator_notes=None
        )

        db.add(exp)
        db.commit()
        db.refresh(exp)
        return exp

    @staticmethod
    def build_benchmark_matrix(db: Session) -> BenchmarkMatrixResponse:
        experiments = db.query(Experiment).all()
        total_count = len(experiments)
        model_names = list(PROVIDERS.keys())

        matrix_data: Dict[str, Dict[str, MatrixCellResponse]] = {m: {} for m in model_names}

        for m in model_names:
            for cat in REQUIRED_CATEGORIES:
                match = next((e for e in experiments if e.model_name == m and e.category.lower() == cat.lower()), None)
                if match:
                    matrix_data[m][cat] = MatrixCellResponse(
                        model_name=m,
                        category=cat,
                        experiment_id=match.id,
                        generation_time_sec=match.generation_time_sec,
                        cost_inr=match.cost_inr,
                        cost_type=match.cost_type,
                        accuracy_score=match.overall_score,
                        meets_all_reqs=bool(match.meets_time_req and match.meets_cost_req and ((match.overall_score or 0) >= 2.5)),
                        result_image_url=match.result_image_url,
                        is_evaluated=match.is_evaluated,
                        tested=True
                    )
                else:
                    matrix_data[m][cat] = MatrixCellResponse(
                        model_name=m,
                        category=cat,
                        tested=False
                    )

        rankings: List[SummaryRankingItem] = []
        for m in model_names:
            model_exps = [e for e in experiments if e.model_name == m]
            provider = PROVIDERS[m]

            if model_exps:
                tests_done = len(model_exps)
                avg_time = round(sum(e.generation_time_sec for e in model_exps) / tests_done, 2)
                avg_cost = round(sum(e.cost_inr for e in model_exps) / tests_done, 2)

                evaluated_scores = [e.overall_score for e in model_exps if e.overall_score is not None]
                avg_acc = round(sum(evaluated_scores) / len(evaluated_scores), 2) if evaluated_scores else None
                passed_count = sum(1 for e in model_exps if (e.overall_score is not None and e.overall_score >= 2.5) and e.meets_time_req and e.meets_cost_req)

                meets_time = avg_time < 15.0
                meets_cost = avg_cost < 4.0

                if tests_done < 10:
                    verdict = f"Incomplete ({tests_done}/10 categories)"
                elif meets_time and meets_cost and (avg_acc or 0) >= 2.5:
                    verdict = "Production-Ready"
                else:
                    verdict = "Thresholds Unmet"

                rankings.append(SummaryRankingItem(
                    model=m,
                    tests_completed=tests_done,
                    avg_accuracy_score=avg_acc,
                    avg_generation_time_sec=avg_time,
                    avg_cost_inr=avg_cost,
                    cost_type=model_exps[0].cost_type,
                    categories_passed=f"{passed_count}/{tests_done}",
                    passed_count=passed_count,
                    license=provider.get_license(),
                    meets_time_constraint=meets_time,
                    meets_cost_constraint=meets_cost,
                    production_verdict=verdict
                ))

        rankings.sort(key=lambda r: (r.tests_completed, r.passed_count), reverse=True)

        return BenchmarkMatrixResponse(
            categories=REQUIRED_CATEGORIES,
            models=model_names,
            total_experiments_recorded=total_count,
            matrix=matrix_data,
            summary_rankings=rankings,
            has_data=total_count > 0
        )

    @staticmethod
    def get_optimization_comparison(db: Session) -> Dict[str, Any]:
        ethnic_cats = ["Saree", "Kurti", "Lehenga"]
        baseline_exps = db.query(Experiment).filter(
            Experiment.model_name.ilike("%IDM-VTON (Baseline)%"),
            Experiment.category.in_(ethnic_cats)
        ).all()
        optimized_exps = db.query(Experiment).filter(
            Experiment.model_name.ilike("%IDM-VTON (Optimized)%"),
            Experiment.category.in_(ethnic_cats)
        ).all()

        comparison = []
        for cat in ethnic_cats:
            base = next((e for e in baseline_exps if e.category.lower() == cat.lower()), None)
            opt = next((e for e in optimized_exps if e.category.lower() == cat.lower()), None)

            if base and opt:
                has_scores = (base.overall_score is not None) and (opt.overall_score is not None)
                delta_pct = round(((opt.overall_score - base.overall_score) / base.overall_score) * 100, 1) if (has_scores and base.overall_score > 0) else None

                comparison.append({
                    "category": cat,
                    "has_data": True,
                    "baseline": {
                        "experiment_id": base.id,
                        "generation_time_sec": base.generation_time_sec,
                        "cost_inr": base.cost_inr,
                        "overall": base.overall_score,
                        "result_image_url": base.result_image_url,
                        "notes": base.evaluator_notes
                    },
                    "optimized": {
                        "experiment_id": opt.id,
                        "generation_time_sec": opt.generation_time_sec,
                        "cost_inr": opt.cost_inr,
                        "overall": opt.overall_score,
                        "result_image_url": opt.result_image_url,
                        "technique": opt.optimization_technique,
                        "notes": opt.evaluator_notes
                    },
                    "accuracy_improvement_pct": delta_pct
                })
            else:
                comparison.append({
                    "category": cat,
                    "has_data": False,
                    "status_note": "No experiments recorded yet for both baseline and optimized models in this category.",
                    "baseline": None,
                    "optimized": None,
                    "accuracy_improvement_pct": None
                })

        return {
            "title": "IDM-VTON Saree & Kurti Optimization Study",
            "comparison": comparison,
            "has_complete_data": any(c.get("has_data") for c in comparison)
        }


eval_service = EvaluationService()
