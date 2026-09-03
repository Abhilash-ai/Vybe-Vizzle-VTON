def test_save_and_favorite_look(client):
    # 1. Save look
    payload = {
        "title": "Summer Riviera Look",
        "person_image_url": "/data/samples/models/model_leo.jpg",
        "garment_image_url": "/data/samples/garments/garm_silk_shirt.png",
        "result_image_url": "/data/results/sample_look_1.jpg",
        "garment_name": "Champagne Silk Cuban Shirt",
        "garment_category": "shirt",
        "provider": "demo",
        "is_favorite": False
    }
    save_res = client.post("/api/v1/looks", json=payload)
    assert save_res.status_code == 200
    look = save_res.json()
    look_id = look["id"]
    assert look["title"] == "Summer Riviera Look"

    # 2. Get look by id
    get_res = client.get(f"/api/v1/looks/{look_id}")
    assert get_res.status_code == 200
    assert get_res.json()["garment_name"] == "Champagne Silk Cuban Shirt"

    # 3. List looks
    list_res = client.get("/api/v1/looks")
    assert list_res.status_code == 200
    assert any(l["id"] == look_id for l in list_res.json())
