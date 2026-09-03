# Vizzle VTON — REST API Reference
**Base Path**: `/api/v1`

---

## 1. Health & Infrastructure

### `GET /api/v1/health`
Checks backend service health, version, and active provider mode.

### `GET /api/v1/providers`
Returns capabilities and readiness status across all configured VTON providers.

### `GET /api/v1/benchmarks`
Returns model comparison matrix, system hardware inspection (PyTorch, CUDA GPU, CPU topology), and recent execution latency logs.

---

## 2. Authentication

### `POST /api/v1/auth/guest`
Creates an instant ephemeral guest session for zero-friction try-on.
- **Response**: `{ access_token: string, token_type: "bearer", user: {...}, is_guest: true }`

### `POST /api/v1/auth/register`
Registers a new user account.
- **Body**: `{ email: string, password: string, full_name?: string }`

### `POST /api/v1/auth/login`
Authenticates existing user with JWT token.
- **Body**: `{ email: string, password: string }`

### `GET /api/v1/auth/me`
Retrieves authenticated user profile.
- **Header**: `Authorization: Bearer <token>`

---

## 3. Try-On Engine

### `POST /api/v1/tryon`
Submits a virtual try-on job.
- **Body**:
  ```json
  {
    "person_image_url": "/data/samples/models/model_maya.jpg",
    "garment_image_url": "/data/samples/garments/garm_silk_shirt.png",
    "garment_category": "shirt",
    "provider": "demo",
    "options": {
      "preserve_face": true,
      "preserve_background": true,
      "garment_fit": "regular",
      "generation_quality": "high"
    }
  }
  ```
- **Response**: `TryOnJobResponse`

### `GET /api/v1/tryon/{job_id}`
Polls status and progress of a specific try-on job.

### `POST /api/v1/tryon/upload-person`
Uploads a custom portrait image.
- **Form Data**: `file: File`

---

## 4. Garments & Wardrobe

### `GET /api/v1/garments`
Lists garments in wardrobe (supports `?category=shirt&include_samples=true`).

### `POST /api/v1/garments`
Registers a new garment entry.

### `POST /api/v1/garments/upload`
Uploads garment photo and creates entry.

### `DELETE /api/v1/garments/{id}`
Deletes garment from wardrobe and removes underlying file.

---

## 5. Saved Looks

### `GET /api/v1/looks`
Lists saved virtual try-on looks (`?favorite_only=true`).

### `POST /api/v1/looks`
Saves generated try-on look to personal collection.

### `PATCH /api/v1/looks/{id}/favorite`
Toggles favorite bookmark status.

### `DELETE /api/v1/looks/{id}`
Deletes look from wardrobe.

---

## 6. Privacy & Data Purge

### `POST /api/v1/user/privacy/wipe-all`
Permanently deletes all uploaded portraits, custom garments, saved looks, and job history.
