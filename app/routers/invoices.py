from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import get_current_user
from app.config import INVOICE_UPLOAD_FOLDER
import shutil
from app.models import InvoiceDB, JournalEntryDB, JournalLineDB, UserDB
from app.schemas import (
    InvoiceResponse,
    InvoiceDetailResponse,
    InvoiceUpdate,
    JournalEntryResponse,
)
from app.services.ai import (
    extract_invoice_data,
    suggest_journal_entry,
)
from app.services.ocr import extract_text_from_pdf

router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"],
)


@router.get("/", response_model=List[InvoiceResponse])
async def read_invoices(
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    return db.query(InvoiceDB).filter(InvoiceDB.user_id == current_user.id).all()


@router.get("/{invoice_id}", response_model=InvoiceDetailResponse)
async def read_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    invoice = (
        db.query(InvoiceDB)
        .filter(InvoiceDB.id == invoice_id, InvoiceDB.user_id == current_user.id)
        .first()
    )

    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")

    return invoice


@router.post("/upload")
async def upload_invoice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    if file.filename is None:
        raise HTTPException(
            status_code=400,
            detail="Filnamn saknas.",
        )

    filepath = INVOICE_UPLOAD_FOLDER / file.filename

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    raw_text = extract_text_from_pdf(str(filepath))
    invoice_data = extract_invoice_data(raw_text)

    invoice = InvoiceDB(
        user_id=current_user.id,
        filename=file.filename,
        status="review_required",
        raw_text=raw_text,
        supplier=invoice_data["supplier"],
        invoice_number=invoice_data["invoice_number"],
        invoice_date=invoice_data["invoice_date"],
        total_amount=invoice_data["total_amount"],
        vat_amount=invoice_data["vat_amount"],
        ai_summary=invoice_data["ai_summary"],
    )

    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    return {
        "message": "Invoice uploaded successfully",
        "id": invoice.id,
        "filename": invoice.filename,
        "status": invoice.status,
    }


# --------- UPDATE INVOICE ---------
@router.patch("/{invoice_id}", response_model=InvoiceDetailResponse)
async def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    invoice = (
        db.query(InvoiceDB)
        .filter(
            InvoiceDB.id == invoice_id,
            InvoiceDB.user_id == current_user.id,
        )
        .first()
    )

    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")

    update_data = invoice_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(invoice, key, value)

    db.commit()
    db.refresh(invoice)

    return invoice


# --------- DELETE INVOICE ---------
@router.delete("/{invoice_id}")
async def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    invoice = (
        db.query(InvoiceDB)
        .filter(
            InvoiceDB.id == invoice_id,
            InvoiceDB.user_id == current_user.id,
        )
        .first()
    )

    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")

    db.delete(invoice)
    db.commit()

    return {"message": "Invoice deleted successfully"}


# --------- APPROVE INVOICE ---------
@router.post("/{invoice_id}/approve", response_model=InvoiceDetailResponse)
async def approve_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    invoice = (
        db.query(InvoiceDB)
        .filter(
            InvoiceDB.id == invoice_id,
            InvoiceDB.user_id == current_user.id,
        )
        .first()
    )

    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice.status = "approved"

    db.commit()
    db.refresh(invoice)

    return invoice


@router.post(
    "/{invoice_id}/journal",
    response_model=JournalEntryResponse,
)
async def create_journal(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    invoice = (
        db.query(InvoiceDB)
        .filter(
            InvoiceDB.id == invoice_id,
            InvoiceDB.user_id == current_user.id,
        )
        .first()
    )

    if invoice is None:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found",
        )

    if invoice.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Invoice must be approved first.",
        )

    existing = (
        db.query(JournalEntryDB).filter(JournalEntryDB.invoice_id == invoice.id).first()
    )

    if existing:
        return existing

    ai_result = suggest_journal_entry(invoice)

    if "lines" not in ai_result:
        raise HTTPException(
            status_code=500,
            detail="AI did not return any journal lines.",
        )

    total_debit = sum(line["debit"] for line in ai_result["lines"])
    total_credit = sum(line["credit"] for line in ai_result["lines"])

    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(
            status_code=500,
            detail="Journal entry is not balanced.",
        )

    entry = JournalEntryDB(
        invoice_id=invoice.id,
        status="draft",
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    for line in ai_result["lines"]:
        db.add(
            JournalLineDB(
                journal_entry_id=entry.id,
                account=line["account"],
                description=line["description"],
                debit=line["debit"],
                credit=line["credit"],
            )
        )

    db.commit()
    db.refresh(entry)

    return entry
