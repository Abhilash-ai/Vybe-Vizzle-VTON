from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.garment import Garment
from ..schemas.garment import GarmentCreate, GarmentResponse
from ..services.storage import storage_service
from ..utils.security import get_current_user_optional, get_current_user

router = APIRouter(prefix="/garments", tags=["Garments & Wardrobe"])

SUPPORTED_CATEGORIES = [
    {"id": "t-shirt", "name": "T-Shirt", "type": "upper_body", "description": "Crew necks, V-necks, graphic & plain tees"},
    {"id": "shirt", "name": "Casual & Formal Shirt", "type": "upper_body", "description": "Button-down, dress, oxford shirts"},
    {"id": "hoodie", "name": "Hoodie & Sweatshirt", "type": "upper_body", "description": "Pullover, zip-up fleece & sweaters"},
    {"id": "jacket", "name": "Jacket & Coat", "type": "outerwear", "description": "Blazers, denim, leather, winter coats"},
    {"id": "dress", "name": "Dress & Gown", "type": "full_body", "description": "Cocktail, summer, maxi & evening dresses"},
    {"id": "saree", "name": "Saree & Traditional Drape", "type": "traditional", "description": "Silk, chiffon, designer ethnic sarees"},
    {"id": "kurta", "name": "Kurta & Sherwani", "type": "traditional", "description": "Ethnic tunics, bandhgala & kurtas"},
    {"id": "pants", "name": "Pants & Trousers", "type": "lower_body", "description": "Jeans, chinos, tailored trousers, cargo"},
    {"id": "skirt", "name": "Skirt", "type": "lower_body", "description": "Mini, midi, pleated, A-line skirts"},
    {"id": "other", "name": "Other / Accessory", "type": "accessory", "description": "Scarves, shawls, custom garments"}
]


@router.get("/categories")
def get_categories():
    return SUPPORTED_CATEGORIES


@router.get("", response_model=List[GarmentResponse])
def list_garments(
    category: Optional[str] = None,
    include_samples: bool = True,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Garment)
    
    if current_user:
        if include_samples:
            query = query.filter((Garment.user_id == current_user.id) | (Garment.is_sample == True) | (Garment.user_id == None))
        else:
            query = query.filter(Garment.user_id == current_user.id)
    else:
        if include_samples:
            query = query.filter((Garment.is_sample == True) | (Garment.user_id == None))
        else:
            query = query.filter(Garment.user_id == None)
        
    if category and category.lower() != "all":
        query = query.filter(Garment.category.ilike(category))
        
    return query.order_by(Garment.created_at.desc()).all()


@router.post("", response_model=GarmentResponse)
def create_garment(
    garment_in: GarmentCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    garment = Garment(
        user_id=current_user.id if current_user else None,
        name=garment_in.name,
        category=garment_in.category,
        sub_category=garment_in.sub_category,
        color=garment_in.color,
        brand=garment_in.brand,
        image_url=garment_in.image_url,
        thumbnail_url=garment_in.thumbnail_url or garment_in.image_url,
        description=garment_in.description,
        is_sample=garment_in.is_sample or False
    )
    db.add(garment)
    db.commit()
    db.refresh(garment)
    return garment


@router.post("/upload")
async def upload_garment_file(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    category: Optional[str] = Form("t-shirt"),
    color: Optional[str] = Form(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
    
    url, path = await storage_service.save_upload_file(file)
    
    garment = Garment(
        user_id=current_user.id if current_user else None,
        name=name or file.filename.split(".")[0].replace("-", " ").title(),
        category=category or "t-shirt",
        color=color,
        image_url=url,
        thumbnail_url=url,
        is_sample=False
    )
    db.add(garment)
    db.commit()
    db.refresh(garment)
    
    return garment


@router.delete("/{garment_id}")
def delete_garment(
    garment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    garment = db.query(Garment).filter(Garment.id == garment_id).first()
    if not garment:
        raise HTTPException(status_code=404, detail="Garment not found.")
    
    if garment.user_id and garment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this garment.")
        
    storage_service.wipe_user_files([garment.image_url])
    db.delete(garment)
    db.commit()
    return {"status": "success", "message": "Garment deleted."}
