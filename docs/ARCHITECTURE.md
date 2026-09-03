# Vizzle VTON — Architecture Design Document
**AM Studio · Generative AI Fashion Engineering**

---

## 1. System Overview

Vizzle VTON is architected with a decoupled modular design separating presentation, backend API orchestration, database persistence, asset storage, and virtual try-on inference providers.

```
┌─────────────────────────────────────────────────────────────┐
│                 Vizzle VTON Web Interface                   │
│   (React 18 + TypeScript + Tailwind CSS + Lucide Icons)     │
└──────────────┬───────────────────────────────▲──────────────┘
               │ HTTP / REST & Multipart       │
               ▼                               │ JSON Responses
┌──────────────────────────────────────────────┴──────────────┐
│                  FastAPI Backend Gateway                    │
│      - JWT & Guest Authentication                           │
│      - Input & Image Validation Layer (Pillow)              │
│      - Try-On Job Scheduler & Background Worker             │
│      - Privacy Data Purge Engine                            │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  SQLAlchemy  │       │ Local / Cloud│       │ VTON Provider│
│   Database   │       │ File Storage │       │  Abstraction │
│(SQLite/Postg)│       │ (/data/...)  │       └───────┬──────┘
└──────────────┘       └──────────────┘               │
                                       ┌──────────────┼──────────────┐
                                       ▼              ▼              ▼
                                ┌────────────┐ ┌────────────┐ ┌────────────┐
                                │    Demo    │ │   FASHN    │ │  Replicate │
                                │ Harmonizer │ │ Commercial │ │ / HuggingF │
                                │  (Offline) │ │  Cloud API │ │ (IDM/OOTD) │
                                └────────────┘ └────────────┘ └────────────┘
```

---

## 2. Core Subsystems

### 2.1 Virtual Try-On Provider Interface (`BaseVTONProvider`)
All AI virtual try-on providers inherit from `BaseVTONProvider`, implementing uniform methods:
- `generate_tryon(person_path, garment_path, category, options, job_id)`
- `get_status(job_id)`
- `is_available()`
- `get_capabilities()`

Implemented Providers:
1. **`DemoVTONProvider`**: High-fidelity local harmonization engine running on CPU without external dependencies. Utilizes alpha mask feathering, lighting adjustment, and transparent labeling.
2. **`FashnVTONProvider`**: Commercial production cloud API for SOTA virtual try-on with high face and fabric preservation.
3. **`HuggingFaceVTONProvider`**: Integration endpoint for IDM-VTON / CatVTON models.
4. **`ReplicateVTONProvider`**: Serverless cloud GPU integration for OOTDiffusion.

### 2.2 Asynchronous Job Lifecycle
1. User submits request via `POST /api/v1/tryon`.
2. Backend creates `TryOnJob` record (`status: "queued"`) and spawns FastAPI background worker.
3. Worker reports step-by-step progress (`20% Human Parsing` -> `40% Cloth Warping` -> `70% Latent Diffusion` -> `90% Post-Processing` -> `100% Completed`).
4. Result image is stored in `/data/results/` and metadata is logged to `BenchmarkLog`.

### 2.3 Privacy & Data Sovereign Storage
- Uploaded files are assigned UUID names and stored under `/data/uploads/`.
- Generated looks are saved under `/data/results/`.
- Calling `POST /api/v1/user/privacy/wipe-all` cleans up all physical files associated with the user and purges database records.
