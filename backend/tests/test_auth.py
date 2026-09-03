def test_register_and_login_flow(client):
    # Register
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "designer@amstudio.com",
            "password": "SecurePassword123!",
            "full_name": "Fashion Designer"
        }
    )
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "designer@amstudio.com"

    # Duplicate register should fail
    dup_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "designer@amstudio.com",
            "password": "OtherPassword"
        }
    )
    assert dup_res.status_code == 400

    # Login with valid credentials
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "designer@amstudio.com",
            "password": "SecurePassword123!"
        }
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Verify /auth/me with bearer token
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "designer@amstudio.com"


def test_guest_session_creation(client):
    res = client.post("/api/v1/auth/guest")
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["is_guest"] is True
    assert "@vizzle.ai" in data["user"]["email"]
