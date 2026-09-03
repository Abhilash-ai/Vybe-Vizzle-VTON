from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.garment import Garment
from ..models.look import GeneratedLook
from ..models.tryon_job import TryOnJob
from ..models.outfit import Outfit
from ..schemas.user import UserProfile, UserUpdate, PrivacyWipeResponse
from ..services.storage import storage_service
from ..utils.security import get_current_user

router = APIRouter(prefix="/user", tags=["User Profile & Privacy"])


@router.get("/profile", response_model=UserProfile)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserProfile)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
        
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/privacy/wipe-all", response_model=PrivacyWipeResponse)
def wipe_all_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Privacy compliance endpoint: Permanently deletes all uploaded portraits,
    custom wardrobe garments, generated try-on looks, outfit boards, and job records.
    """
    # 1. Collect all file URLs for cleanup
    user_looks = db.query(GeneratedLook).filter(GeneratedLook.user_id == current_user.id).all()
    user_garments = db.query(Garment).filter(Garment.user_id == current_user.id).all()
    user_jobs = db.query(TryOnJob).filter(TryOnJob.user_id == current_user.id).all()
    
    file_urls = []
    for look in user_looks:
        file_urls.extend([look.person_image_url, look.result_image_url])
    for garment in user_garments:
        if not garment.is_sample:
            file_urls.append(garment.image_url)
    for job in user_jobs:
        file_urls.extend([job.person_image_url, job.result_image_url or ""])
        
    # 2. Delete physical files from disk
    deleted_files_count = storage_service.wipe_user_files(file_urls)
    
    # 3. Cascade delete database entities
    looks_count = len(user_looks)
    garments_count = len(user_garments)
    jobs_count = len(user_jobs)
    
    db.query(GeneratedLook).filter(GeneratedLook.user_id == current_user.id).delete()
    db.query(Outfit).filter(Outfit.user_id == current_user.id).delete()
    db.query(TryOnJob).filter(TryOnJob.user_id == current_user.id).delete()
    db.query(Garment).filter(Garment.user_id == current_user.id).delete()
    db.commit()
    
    return PrivacyWipeResponse(
        status="success",
        deleted_images_count=deleted_files_count,
        deleted_looks_count=looks_count,
        deleted_jobs_count=jobs_count,
        deleted_garments_count=garments_count,
        message="All personal portraits, custom garments, and virtual try-on history have been permanently wiped."
    )
