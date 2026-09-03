from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.look import GeneratedLook
from ..schemas.look import LookCreate, LookResponse
from ..services.storage import storage_service
from ..utils.security import get_current_user_optional, get_current_user

router = APIRouter(prefix="/looks", tags=["Saved Looks & Gallery"])


@router.get("", response_model=List[LookResponse])
def list_looks(
    favorite_only: bool = False,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(GeneratedLook)
    if current_user:
        query = query.filter(GeneratedLook.user_id == current_user.id)
    if favorite_only:
        query = query.filter(GeneratedLook.is_favorite == True)
    return query.order_by(GeneratedLook.created_at.desc()).all()


@router.post("", response_model=LookResponse)
def save_look(
    look_in: LookCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    look = GeneratedLook(
        user_id=current_user.id if current_user else None,
        tryon_job_id=look_in.tryon_job_id,
        title=look_in.title or "Curated Look",
        person_image_url=look_in.person_image_url,
        garment_image_url=look_in.garment_image_url,
        result_image_url=look_in.result_image_url,
        garment_name=look_in.garment_name,
        garment_category=look_in.garment_category,
        provider=look_in.provider,
        generation_time_ms=look_in.generation_time_ms,
        notes=look_in.notes,
        is_favorite=look_in.is_favorite or False
    )
    db.add(look)
    db.commit()
    db.refresh(look)
    return look


@router.get("/{look_id}", response_model=LookResponse)
def get_look_by_id(look_id: str, db: Session = Depends(get_db)):
    look = db.query(GeneratedLook).filter(GeneratedLook.id == look_id).first()
    if not look:
        raise HTTPException(status_code=404, detail="Saved look not found.")
    return look


@router.patch("/{look_id}/favorite", response_model=LookResponse)
def toggle_favorite_look(
    look_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    look = db.query(GeneratedLook).filter(GeneratedLook.id == look_id).first()
    if not look:
        raise HTTPException(status_code=404, detail="Look not found.")
    if look.user_id and look.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")
        
    look.is_favorite = not look.is_favorite
    db.commit()
    db.refresh(look)
    return look


@router.delete("/{look_id}")
def delete_look(
    look_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    look = db.query(GeneratedLook).filter(GeneratedLook.id == look_id).first()
    if not look:
        raise HTTPException(status_code=404, detail="Look not found.")
    if look.user_id and look.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")
        
    storage_service.wipe_user_files([look.result_image_url])
    db.delete(look)
    db.commit()
    return {"status": "success", "message": "Look deleted from wardrobe."}
