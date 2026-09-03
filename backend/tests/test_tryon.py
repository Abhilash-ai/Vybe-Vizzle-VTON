import time


def test_tryon_submission_and_polling(client):
    payload = {
        "person_image_url": "/data/samples/models/model_maya.jpg",
        "garment_image_url": "/data/samples/garments/garm_silk_shirt.png",
        "garment_category": "shirt",
        "provider": "demo",
        "options": {
            "preserve_face": True,
            "preserve_background": True,
            "garment_fit": "regular",
            "generation_quality": "high"
        }
    }

    # Submit job
    submit_res = client.post("/api/v1/tryon", json=payload)
    assert submit_res.status_code == 200
    job_data = submit_res.json()
    job_id = job_data["id"]
    assert job_data["status"] in ["queued", "processing", "completed"]

    # Poll status
    status_res = client.get(f"/api/v1/tryon/{job_id}")
    assert status_res.status_code == 200
    assert status_res.json()["id"] == job_id


def test_benchmarks_hub_endpoint(client):
    res = client.get("/api/v1/benchmarks")
    assert res.status_code == 200
    data = res.json()
    assert "system" in data
    assert "models" in data
    assert len(data["models"]) >= 4
    # Verify honest environment reporting
    assert data["system"]["vton_provider_active"] is not None
