def test_test_manifest_endpoint(client):
    res = client.get("/api/v1/eval/manifest")
    assert res.status_code == 200
    data = res.json()
    assert data["total_test_cases"] >= 10
    assert data["valid_test_cases"] == data["total_test_cases"]
    assert data["dataset_status"] == "FULLY_VALIDATED"


def test_run_evaluation_endpoint(client):
    payload = {
        "model_name": "CatVTON",
        "category": "Saree",
        "person_image_url": "/data/samples/models/model_maya.jpg",
        "garment_image_url": "/data/samples/garments/garm_royal_saree.jpg",
        "garment_name": "Royal Banarasi Saree",
        "is_optimized": False
    }
    res = client.post("/api/v1/eval/run", json=payload)
    assert res.status_code == 200
    exp = res.json()
    assert exp["model_name"] == "CatVTON"
    assert exp["category"] == "Saree"
    assert exp["generation_time_sec"] < 15.0
    assert exp["cost_inr"] < 4.0
    assert exp["meets_time_req"] is True
    assert exp["meets_cost_req"] is True
    assert exp["is_evaluated"] is False  # Starts un-evaluated until human rubric is submitted!


def test_score_experiment_endpoint(client):
    # 1. Run inference test
    payload = {
        "model_name": "CatVTON",
        "category": "Kurti",
        "person_image_url": "/data/samples/models/model_maya.jpg",
        "garment_image_url": "/data/samples/garments/garm_linen_kurta.jpg"
    }
    run_res = client.post("/api/v1/eval/run", json=payload)
    exp_id = run_res.json()["id"]

    # 2. Human evaluator submits 0-4 rubric
    score_payload = {
        "fit_score": 3.8,
        "drape_score": 3.6,
        "texture_score": 3.9,
        "pose_preservation_score": 3.8,
        "body_preservation_score": 3.7,
        "face_preservation_score": 3.9,
        "artifact_score": 3.7,
        "evaluator_notes": "Clean shoulder alignment and continuous hem fall"
    }
    score_res = client.post(f"/api/v1/eval/experiments/{exp_id}/score", json=score_payload)
    assert score_res.status_code == 200
    data = score_res.json()
    assert data["fit_score"] == 3.8
    assert data["overall_score"] is not None
    assert data["overall_score"] > 3.0
    assert data["is_evaluated"] is True


def test_benchmark_matrix_and_optimization_report(client):
    # Dynamic matrix check
    matrix_res = client.get("/api/v1/eval/matrix")
    assert matrix_res.status_code == 200
    m_data = matrix_res.json()
    assert len(m_data["categories"]) == 10
    assert "CatVTON" in m_data["models"]
    assert m_data["total_experiments_recorded"] >= 0

    # Optimization report check
    opt_res = client.get("/api/v1/eval/optimization-report")
    assert opt_res.status_code == 200
    assert "IDM-VTON" in opt_res.json()["title"]
    assert "comparison" in opt_res.json()
