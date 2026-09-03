# Deployment Guide: Vizzle VTON
**AM Studio · Production Deployment Manual**

---

## 1. Full-Stack Production Architecture

- **Frontend**: Vercel / Netlify (Static SPA bundle generated via `npm run build`)
- **Backend**: Render / AWS ECS / Railway (FastAPI running with Uvicorn)
- **Database**: Managed PostgreSQL (Supabase / AWS RDS / Neon)
- **Object Storage**: Cloudflare R2 / AWS S3 (for permanent asset storage)
- **AI Inference Layer**: Commercial FASHN API, RunPod Serverless GPU, or Replicate

---

## 2. Deploying Backend (e.g. Render / Railway)

1. Create a Python Web Service pointing to `backend/`.
2. Build Command:
   ```bash
   pip install -r requirements.txt
   ```
3. Start Command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. Environment Variables:
   ```env
   ENVIRONMENT=production
   DEMO_MODE=true
   VTON_PROVIDER=demo
   SECRET_KEY=your-production-secret-key
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   CORS_ORIGINS=["https://your-frontend-app.vercel.app"]
   ```

---

## 3. Deploying Frontend (Vercel)

1. Connect repository with Root Directory set to `frontend/`.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   ```env
   VITE_API_URL=https://your-backend-service.onrender.com/api/v1
   ```

---

## 4. Database Migration to PostgreSQL

By default, the application runs on SQLite. When `DATABASE_URL` starts with `postgresql://`, SQLAlchemy connects directly with connection pooling.
Tables are automatically verified and created on startup.
