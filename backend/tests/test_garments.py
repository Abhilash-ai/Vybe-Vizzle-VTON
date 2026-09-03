def test_list_garment_categories(client):
    res = client.get("/api/v1/garments/categories")
    assert res.status_code == 200
    cats = res.json()
    assert len(cats) >= 10
    cat_ids = [c["id"] for c in cats]
    assert "t-shirt" in cat_ids
    assert "saree" in cat_ids
    assert "kurta" in cat_ids
    assert "dress" in cat_ids


def test_create_and_list_garment(client):
    # Create garment
    payload = {
        "name": "Cashmere Knit Sweater",
        "category": "hoodie",
        "color": "Oatmeal",
        "brand": "AM Atelier",
        "image_url": "/data/samples/garments/sample_sweater.png",
        "is_sample": False
    }
    create_res = client.post("/api/v1/garments", json=payload)
    assert create_res.status_code == 200
    garment = create_res.json()
    assert garment["name"] == "Cashmere Knit Sweater"
    assert garment["category"] == "hoodie"

    # List garments
    list_res = client.get("/api/v1/garments")
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(g["name"] == "Cashmere Knit Sweater" for g in items)
