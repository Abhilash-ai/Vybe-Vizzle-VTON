# VYBE
## Vizzle × Virtual Try-On Benchmarking Engine

**VYBE** is an empirical Virtual Try-On (VTON) benchmarking and evaluation engine developed for the **Vizzle Virtual Try-On Model Evaluation** assignment ([www.vizzle.in](https://www.vizzle.in/)).

The primary objective is to evaluate candidate Virtual Try-On models across **10 required clothing categories** under strict production constraints:
1. **Accuracy**: Best-in-class garment fit, drape, texture fidelity, and identity preservation.
2. **Generation Speed**: Measured latency **under 15.0 seconds** per image.
3. **Cost**: Unit economics **under ₹4.00 INR** per generation.
4. **Reliability & Category Coverage**: Performance across all 10 mandated categories.
5. **Optimization**: Address and evaluate the known out-of-the-box failure of IDM-VTON on continuous ethnic garments (Saree & Kurti).

---

## 1. Candidate Models Researched & Evaluated

| Model Candidate | Architecture / Provider | License | Hardware Requirement | Cost Model (INR) | Production Feasibility |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CatVTON** | Concatenation Latent Diffusion (899M params) | **Apache 2.0** | NVIDIA RTX 4090 / A10G (8GB VRAM) | ~$0.29/hr GPU compute (~₹0.65 / gen) | **Commercially Permissive** |
| **FASHN API** | Multi-Layer Commercial Diffusion API | **Commercial API** | Cloud Hosted REST API | $0.045 / call (₹3.75 / gen) | **Commercially Permissive** |
| **IDM-VTON (Base & Opt)** | UNet + IP-Adapter Attention (1.4B params) | **CC-BY-NC-SA 4.0** | NVIDIA A100 (16GB+ VRAM) | ~$0.89/hr A100 GPU (~₹1.95 – ₹2.25 / gen) | **Non-Commercial / Research Only** |
| **OOTDiffusion** | Outfitting-Over-Time Latent Diffusion | **OpenRAIL-M** | NVIDIA T4 / A10G (12GB VRAM) | ~$0.38/hr Serverless (~₹2.10 / gen) | **Commercially Permissive** |
| **Local Baseline (CPU)** | Spatial Mask Alignment & Color Harmonizer | **MIT** | Local CPU (0GB VRAM) | ₹0.00 / gen | **Local Test Harness** |

---

## 2. Ten Required Clothing Categories

The system standardizes testing across all 10 categories specified by Vizzle:
1. **Saree** (Traditional continuous diagonal drape)
2. **Kurti** (Long tunic with side slits and knee-length hemline)
3. **Lehenga** (Flared multi-piece ethnic ensemble)
4. **Top** (Western upper silhouette)
5. **T-shirt** (Casual crewneck tee)
6. **Jumpsuit** (Full-body one-piece garment)
7. **Coat** (Heavy structured outerwear)
8. **Shirt** (Collared button-up shirt)
9. **Jeans** (Denim bottoms)
10. **Trousers** (Formal tailored bottoms)

---

## 3. Evaluation Methodology

### Standardized Test Manifest (`data/manifests/tests.csv`)
To ensure controlled reproducibility, candidate models are evaluated using identical paired inputs with confirmed file existence on disk:
- Paired model portraits (`model_maya.jpg`, `model_leo.jpg`, `model_zara.jpg`, etc.)
- Paired garment photography (`garm_royal_saree.jpg`, `garm_linen_kurta.jpg`, `garm_silk_shirt.jpg`, etc.)

### Measured Metrics
- **Generation Time (`duration_ms`)**: Real millisecond timer started immediately before inference and stopped immediately upon output delivery.
- **Unit Cost (`cost_inr`)**:
  - Commercial API: Fixed API call rate converted to INR @ ₹83.3 / USD.
  - Self-Hosted GPU: Measured duration (s) × GPU hourly rate × ₹83.3 / USD + bandwidth overhead.
  - Local CPU: ₹0.00.
  - Labeled explicitly as `Actual` or `Estimated`.

### Human Evaluation Rubric (0 to 4 Scale)
Each completed experiment is graded by the evaluator across 7 qualitative dimensions:

$$\text{Overall Score} = \frac{\text{Fit} + \text{Drape} + \text{Texture} + \text{Pose} + \text{Body} + \text{Face} + \text{Artifacts}}{7}$$

- **0 = Failed / Unusable**: Severe boundary tearing, incorrect placement, or unrecognized subject.
- **1 = Poor**: Obvious distortion, truncated boundaries, or unnatural drape.
- **2 = Acceptable**: Passable fit with minor boundary artifacts.
- **3 = Good**: Natural fitting, faithful texture, clean body preservation.
- **4 = Excellent / Production-Grade**: High realism indistinguishable from studio photography.

---

## 4. IDM-VTON Saree & Kurti Optimization Study

### Root Cause of Baseline Failure
Standard IDM-VTON assumes separate upper-body (torso) and lower-body (legs) bounding-box segmentation. Continuous silhouettes like Sarees (with diagonal *pallu* drapes over the shoulder) and long Kurtis get truncated at the waist/hip line, resulting in severe border tearing and hallucination artifacts.

### Implemented Optimization Pipeline
1. **Continuous Full-Body Parsing**: Replaced rigid torso boxes with continuous silhouette parsing.
2. **Adaptive Mask Dilation (18% Gaussian Expansion)**: Dynamically expanded the inpainting region around the torso, waist, and floor-length hemline based on garment aspect ratio.
3. **Neckline & Skin Gradient Preservation**: Maintained natural collar and skin tone transitions.

The workbench allows live A/B benchmarking between baseline and optimized runs to compute empirical deltas dynamically.

---

## 5. System Setup & Reproduction Guide

### Environment Requirements
- **Python**: 3.10+
- **Node.js**: 18+
- **Database**: SQLite (initialized automatically)

### 1. Configure Environment Variables
Copy the template configuration file:
```powershell
cp .env.example .env
```
*(Optional: Add `FASHN_API_KEY`, `REPLICATE_API_TOKEN`, or custom `CATVTON_ENDPOINT_URL` / `IDMVTON_ENDPOINT_URL` if testing remote cloud endpoints).*

### 2. Start FastAPI Backend (Port 8000)
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Start Vite Frontend (Port 5173)
```powershell
cd frontend
npm install
npm run dev
```

### 4. Run Automated Test Suite
```powershell
python -m pytest backend/tests -v
```
*(15 out of 15 unit and integration tests passing).*

---

## 6. Accessing the Platform

- **Workbench Web Interface**: [http://localhost:5173](http://localhost:5173)
- **Interactive Swagger API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **CSV Experiment Export**: [http://127.0.0.1:8000/api/v1/eval/export-csv](http://127.0.0.1:8000/api/v1/eval/export-csv)
