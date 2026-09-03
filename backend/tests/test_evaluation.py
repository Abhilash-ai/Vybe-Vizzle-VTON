def test_test_manifest_endpoint(client):
    res = client.get("/api/v1/eval/manifest")
    assert res.status_code == 200
    data = res.json()
    assert data["categories_count"] == 10
    assert "Saree" in data["required_categories"]
    assert "Kurti" in data["required_categories"]
    assert "Lehenga" in data["required_categories"]
    assert len(data["test_dataset"]) >= 10


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


def test_score_experiment_endpoint(client):
    # Run an experiment first
    payload = {
        "model_name": "CatVTON",
        "category": "Kurti",
        "person_image_url": "/data/samples/models/model_maya.jpg",
        "garment_image_url": "/data/samples/garments/garm_linen_kurta.jpg"
    }
    run_res = client.post("/api/v1/eval/run", json=payload)
    exp_id = run_res.json()["id"]

    # Score with 0-4 rubric
    score_payload = {
        "fit_score": 3.8,
        "drape_score": 3.6,
        "texture_score": 3.9,
        "artifact_score": 3.7,
        "face_score": 3.9,
        "body_score": 3.8,
        "notes": "Excellent shoulder alignment and hem fall"
    }
    score_res = client.post(f"/api/v1/eval/experiments/{exp_id}/score", json=score_payload)
    assert score_res.status_code == 200
    data = score_res.json()
    assert data["fit_score"] == 3.8
    assert data["overall_score"] > 3.0
    assert data["meets_accuracy_req"] is True


def test_benchmark_matrix_and_optimization_report(client):
    # Matrix
    matrix_res = client.get("/api/v1/eval/matrix")
    assert matrix_res.status_code == 200
    m_data = matrix_res.json()
    assert len(m_data["categories"]) == 10
    assert "CatVTON" in m_data["models"]
    assert len(m_data["summary_rankings"]) > 0

    # Optimization report
    opt_res = client.get("/api/v1/eval/optimization-report")
    assert opt_res.status_code == 200
    assert "IDM-VTON" in opt_res.json()["title"]
