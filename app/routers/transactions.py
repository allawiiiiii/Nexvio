from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import TransactionDB
from app.services.matching import match_transactions

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


@router.get("/")
def read_transactions(db: Session = Depends(get_db)):
    return db.query(TransactionDB).all()


@router.post("/match")
def run_matching(db: Session = Depends(get_db)):
    matches = match_transactions(db)

    return {"matches": matches}
