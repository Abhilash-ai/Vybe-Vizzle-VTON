from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.outfit import Outfit
from ..models.garment import Garment
from ..schemas.outfit import OutfitCreate, OutfitResponse
from ..schemas.garment import GarmentResponse
from ..utils.security import get_current_user_optional, get_current_user

router = APIRouter(prefix="/outfits", tags=["Outfit Builder"])


@router.get("", response_model=List[OutfitResponse])
def list_outfits(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Outfit)
    if current_user:
        query = query.filter(Outfit.user_id == current_user.id)
    
    outfits = query.order_by(Outfit.created_at.desc()).all()
    results = []
    
    for outfit in outfits:
        # Load related garments
        garment_list = []
        if outfit.garment_ids:
            garments = db.query(Garment).filter(Garment.id.in_(outfit.garment_ids)).all()
            garment_list = [GarmentResponse.model_validate(g) for g in garments]
            
        res_item = OutfitResponse(
            id=outfit.id,
            user_id=outfit.user_id,
            title=outfit.title,
            description=outfit.description,
            garment_ids=outfit.garment_ids or [],
            garments=garment_list,
            preview_image_url=outfit.preview_image_url,
            created_at=outfit.created_at
        )
        results.append(res_item)
        
    return results


@router.post("", response_model=OutfitResponse)
def create_outfit(
    outfit_in: OutfitCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    outfit = Outfit(
        user_id=current_user.id if current_user else None,
        title=outfit_in.title,
        description=outfit_in.description,
        garment_ids=outfit_in.garment_ids,
        preview_image_url=outfit_in.preview_image_url
    )
    db.add(outfit)
    db.commit()
    db.refresh(outfit)
    
    # Fetch garments
    garments = db.query(Garment).filter(Garment.id.in_(outfit.garment_ids)).all() if outfit.garment_ids else []
    return OutfitResponse(
        id=outfit.id,
        user_id=outfit.user_id,
        title=outfit.title,
        description=outfit.description,
        garment_ids=outfit.garment_ids,
        garments=[GarmentResponse.model_validate(g) for g in garments],
        preview_image_url=outfit.preview_image_url,
        created_at=outfit.created_at
    )


@router.delete("/{outfit_id}")
def delete_outfit(
    outfit_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found.")
    if outfit.user_id and outfit.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")
        
    db.delete(outfit)
    db.commit()
    return {"status": "success", "message": "Outfit removed."}
