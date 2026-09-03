import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.auth import UserRegister, UserLogin, TokenResponse, GuestLoginResponse
from ..schemas.user import UserProfile
from ..utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name or user_in.email.split("@")[0],
        is_guest=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token(data={"sub": user.id, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_guest": False
        }
    }


@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    token = create_access_token(data={"sub": user.id, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "is_guest": user.is_guest
        }
    }


@router.post("/guest", response_model=GuestLoginResponse)
def create_guest_session(db: Session = Depends(get_db)):
    """Creates an instant ephemeral guest session without requiring registration."""
    guest_uuid = uuid.uuid4().hex[:8]
    guest_email = f"guest_{guest_uuid}@vizzle.ai"
    
    user = User(
        email=guest_email,
        hashed_password=get_password_hash(uuid.uuid4().hex),
        full_name="Fashion Creator (Guest)",
        is_guest=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token(data={"sub": user.id, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_guest": True
        },
        "is_guest": True
    }


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
