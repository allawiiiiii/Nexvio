from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InvoiceDB, JournalEntryDB, TransactionDB
from app.schemas import DashboardResponse

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    invoices_total = db.query(func.count(InvoiceDB.id)).scalar() or 0

    invoices_paid = (
        db.query(func.count(InvoiceDB.id)).filter(InvoiceDB.paid == True).scalar() or 0
    )

    invoices_unpaid = invoices_total - invoices_paid

    transactions_total = db.query(func.count(TransactionDB.id)).scalar() or 0

    transactions_matched = (
        db.query(func.count(TransactionDB.id))
        .filter(TransactionDB.status == "matched")
        .scalar()
        or 0
    )

    transactions_unmatched = transactions_total - transactions_matched

    journal_entries_total = db.query(func.count(JournalEntryDB.id)).scalar() or 0

    return DashboardResponse(
        invoices_total=invoices_total,
        invoices_paid=invoices_paid,
        invoices_unpaid=invoices_unpaid,
        transactions_total=transactions_total,
        transactions_matched=transactions_matched,
        transactions_unmatched=transactions_unmatched,
        journal_entries_total=journal_entries_total,
    )
