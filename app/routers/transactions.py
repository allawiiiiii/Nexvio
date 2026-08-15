from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import TransactionDB, StatementDB, UserDB
from app.core.security import get_current_user
from app.services.matching import match_transactions

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


@router.get("/")
def read_transactions(
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    return (
        db.query(TransactionDB)
        .join(StatementDB)
        .filter(StatementDB.user_id == current_user.id)
        .all()
    )


@router.post("/match")
def run_matching(db: Session = Depends(get_db)):
    matches = match_transactions(db)

    return {"matches": matches}
