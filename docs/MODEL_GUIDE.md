# VTON Generative Model Guide & Licensing
**AM Studio · AI/ML Architecture Reference**

---

## 1. Candidate VTON Generative Models

| Model | Architecture | Commercial Safety | License | Recommended Hardware |
| :--- | :--- | :--- | :--- | :--- |
| **Vizzle Local Harmonizer** | Alpha Masking & Torso Lighting Alignment | **Yes** | Built-in Permissive | Any CPU / 0 GB VRAM |
| **FASHN AI API** | Multi-Layer Latent Diffusion | **Yes** | Commercial API | Cloud Hosted (REST) |
| **IDM-VTON** | UNet + IP-Adapter Attention | **No (Research Only)** | CC-BY-NC-SA 4.0 | NVIDIA A100 (16GB+ VRAM) |
| **CatVTON** | Concatenation-based Diffusion (899M) | **Yes** | Apache 2.0 | NVIDIA RTX 4090 / A10G (8GB+) |
| **OOTDiffusion** | Outfitting Over Time Latent Model | **Yes** | OpenRAIL-M | NVIDIA T4 / A10G (12GB+) |

---

## 2. Licensing Compliance Policy

> [!CAUTION]
> **Zero False Licensing Claims**: IDM-VTON is distributed under **CC-BY-NC-SA 4.0 (Non-Commercial)**. It may be utilized for academic benchmarking and local research only. Commercial production deployments must utilize licensed commercial providers (e.g. FASHN API) or Apache 2.0 / MIT models (CatVTON, OOTDiffusion).

---

## 3. Configuring Remote Neural Providers

### Activating FASHN API
Set the following in `.env` or in Profile Settings:
```env
VTON_PROVIDER=fashn
FASHN_API_KEY=fashn_live_your_key_here
```

### Activating Replicate (OOTDiffusion)
```env
VTON_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_your_token_here
REPLICATE_MODEL_VERSION=viktorfa/oot_diffusion
```

### Activating Hugging Face Endpoint (IDM-VTON)
```env
VTON_PROVIDER=huggingface
HUGGINGFACE_API_TOKEN=hf_your_token_here
HUGGINGFACE_MODEL_ENDPOINT=https://your-dedicated-endpoint.endpoints.huggingface.cloud
```
