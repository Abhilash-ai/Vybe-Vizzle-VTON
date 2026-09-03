def test_privacy_wipe_endpoint(client):
    # Register user
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "privacy_user@vizzle.com",
            "password": "Password123!",
            "full_name": "Privacy Conscious User"
        }
    )
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a user garment
    garm_res = client.post(
        "/api/v1/garments",
        json={
            "name": "Private Garment",
            "category": "t-shirt",
            "image_url": "/data/uploads/temp_garment.jpg",
            "is_sample": False
        },
        headers=headers
    )
    assert garm_res.status_code == 200

    # Wipe all user data
    wipe_res = client.post("/api/v1/user/privacy/wipe-all", headers=headers)
    assert wipe_res.status_code == 200
    wipe_data = wipe_res.json()
    assert wipe_data["status"] == "success"
    assert wipe_data["deleted_garments_count"] >= 1

    # Verify user garments are cleaned up
    garments_res = client.get("/api/v1/garments?include_samples=false", headers=headers)
    assert len(garments_res.json()) == 0
