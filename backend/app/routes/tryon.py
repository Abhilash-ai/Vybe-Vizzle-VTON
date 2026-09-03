import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.tryon_job import TryOnJob
from ..models.look import GeneratedLook
from ..schemas.tryon import TryOnRequest, TryOnJobResponse
from ..services.storage import storage_service
from ..services.tryon_service import tryon_service
from ..utils.security import get_current_user_optional, get_current_user
from ..config import settings

router = APIRouter(prefix="/tryon", tags=["Try-On Engine"])


@router.post("", response_model=TryOnJobResponse)
async def create_tryon_job(
    request: TryOnRequest,
    background_tasks: BackgroundTasks,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Submits a virtual try-on inference job. Runs asynchronously in background.
    """
    selected_provider = request.provider or settings.VTON_PROVIDER or "demo"
    
    job = TryOnJob(
        user_id=current_user.id if current_user else None,
        provider=selected_provider,
        person_image_url=request.person_image_url,
        garment_image_url=request.garment_image_url,
        garment_category=request.garment_category,
        options=request.options.model_dump() if request.options else {},
        status="queued",
        progress=5,
        current_step="Job queued for processing..."
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Launch background worker
    background_tasks.add_task(tryon_service.process_tryon_job, job.id)

    return job


@router.get("/{job_id}", response_model=TryOnJobResponse)
def get_tryon_job_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(TryOnJob).filter(TryOnJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Try-on job not found.")
    return job


@router.get("", response_model=List[TryOnJobResponse])
def list_recent_jobs(
    limit: int = 10,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(TryOnJob)
    if current_user:
        query = query.filter(TryOnJob.user_id == current_user.id)
    return query.order_by(TryOnJob.created_at.desc()).limit(limit).all()


@router.post("/upload-person")
async def upload_person_image(
    file: UploadFile = File(...)
):
    """Uploads a person/model image and returns the accessible URL."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
    
    url, path = await storage_service.save_upload_file(file)
    return {"url": url, "filename": file.filename}
