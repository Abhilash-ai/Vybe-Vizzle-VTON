def test_test_manifest_endpoint(client):
    res = client.get("/api/v1/eval/manifest")
    assert res.status_code == 200
    data = res.json()
    assert data["total_test_cases"] >= 10
    assert data["dataset_status"] == "FULLY_VALIDATED"


def test_unconfigured_model_fails_honestly(client):
    # CatVTON without configured GPU endpoint must reject execution with clear error
    payload = {
        "model_name": "CatVTON",
        "category": "Saree",
        "person_image_url": "/data/samples/models/model_maya.jpg",
        "garment_image_url": "/data/samples/garments/garm_royal_saree.jpg",
        "garment_name": "Royal Banarasi Saree",
        "is_optimized": False
    }
    res = client.post("/api/v1/eval/run", json=payload)
    assert res.status_code == 400
    assert "unavailable" in res.json()["detail"].lower()


def test_run_local_baseline_and_score(client):
    # Local Baseline (CPU) is configured and executes actual image synthesis
    payload = {
        "model_name": "Local Baseline (CPU Pipeline)",
        "category": "Kurti",
        "person_image_url": "/data/samples/models/model_maya.jpg",
        "garment_image_url": "/data/samples/garments/garm_linen_kurta.jpg",
        "garment_name": "Linen Kurta",
        "is_optimized": False
    }
    run_res = client.post("/api/v1/eval/run", json=payload)
    assert run_res.status_code == 200
    exp = run_res.json()
    assert exp["model_name"] == "Local Baseline (CPU Pipeline)"
    assert exp["category"] == "Kurti"
    assert exp["generation_status"] == "completed"
    assert exp["is_evaluated"] is False
    assert exp["overall_score"] is None

    exp_id = exp["id"]

    # Human evaluator scores the experiment
    score_payload = {
        "fit_score": 3.0,
        "drape_score": 3.0,
        "texture_score": 3.0,
        "pose_preservation_score": 3.0,
        "body_preservation_score": 3.0,
        "face_preservation_score": 3.0,
        "artifact_score": 3.0,
        "evaluator_notes": "Local CPU test execution baseline"
    }
    score_res = client.post(f"/api/v1/eval/experiments/{exp_id}/score", json=score_payload)
    assert score_res.status_code == 200
    scored_exp = score_res.json()
    assert scored_exp["is_evaluated"] is True
    assert scored_exp["overall_score"] == 3.0


def test_benchmark_matrix_and_optimization_report(client):
    matrix_res = client.get("/api/v1/eval/matrix")
    assert matrix_res.status_code == 200
    m_data = matrix_res.json()
    assert len(m_data["categories"]) == 10
    assert len(m_data["models"]) > 0

    opt_res = client.get("/api/v1/eval/optimization-report")
    assert opt_res.status_code == 200
    assert "comparison" in opt_res.json()
