from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import UserDB
from app.schemas import UserCreate, UserResponse
from app.core.security import hash_password

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing = db.query(UserDB).filter(UserDB.email == user.email).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered.",
        )

    new_user = UserDB(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
