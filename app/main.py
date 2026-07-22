# uvicorn app.main:app --reload
# http://127.0.0.1:8000/docs
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, HTTPException, Depends, File
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal, engine, Base

from app.models import (
    InvoiceDB,
    JournalEntryDB,
    JournalLineDB,
    StatementDB,
    TransactionDB,
)

import json
import os
from pathlib import Path
import shutil

from app.services.ocr import extract_text_from_pdf

from app.services.ai import (
    extract_invoice_data,
    suggest_journal_entry,
)

from typing import List

from app.schemas import (
    InvoiceResponse,
    InvoiceDetailResponse,
    InvoiceUpdate,
    JournalEntryResponse,
    StatementUploadResponse,
    DashboardResponse,
)

from app.services.statement_parser import (
    extract_text,
    parse_transactions,
    save_transactions,
)

UPLOAD_FOLDER = Path("uploads")
INVOICE_UPLOAD_FOLDER = UPLOAD_FOLDER / "invoices"
STATEMENT_UPLOAD_FOLDER = UPLOAD_FOLDER / "statements"

INVOICE_UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
STATEMENT_UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# --------- LOAD ENV ---------
load_dotenv()

# --------- DATABASE SETUP ---------
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------- OPENAI CLIENT ---------
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --------- FASTAPI APP ---------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------- REQUEST MODEL ---------
class ParseRequest(BaseModel):
    text: str


# --------- AI PARSE ENDPOINT (Legacy) ---------
@app.post("/ai-parse/")
async def ai_parse(request: ParseRequest, db: Session = Depends(get_db)):

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """
                Extract supplier, invoice_number (if available),
                invoice_date (YYYY-MM-DD),
                total_amount and vat_amount from the text.

                Return ONLY valid JSON.
                """,
            },
            {"role": "user", "content": request.text},
        ],
    )

    content = response.choices[0].message.content

    if content is None:
        raise HTTPException(status_code=500, detail="AI returned empty response")

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI did not return valid JSON")

    invoice_db = InvoiceDB(
        supplier=parsed.get("supplier"),
        invoice_number=parsed.get("invoice_number"),
        invoice_date=parsed.get("invoice_date"),
        total_amount=parsed.get("total_amount"),
        vat_amount=parsed.get("vat_amount"),
    )

    db.add(invoice_db)
    db.commit()
    db.refresh(invoice_db)

    return invoice_db


# --------- GET ALL INVOICES ---------
@app.get("/invoices/", response_model=List[InvoiceResponse])
async def read_invoices(db: Session = Depends(get_db)):
    return db.query(InvoiceDB).all()


# --------- GET SINGLE INVOICE ---------
@app.get("/invoices/{invoice_id}", response_model=InvoiceDetailResponse)
async def read_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(InvoiceDB).filter(InvoiceDB.id == invoice_id).first()

    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")

    return invoice


# --------- UPDATE INVOICE ---------
@app.patch("/invoices/{invoice_id}", response_model=InvoiceDetailResponse)
async def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    db: Session = Depends(get_db),
):
    invoice = db.query(InvoiceDB).filter(InvoiceDB.id == invoice_id).first()

    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")

    update_data = invoice_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(invoice, key, value)

    db.commit()
    db.refresh(invoice)

    return invoice


# --------- DELETE INVOICE ---------
@app.delete("/invoices/{invoice_id}")
async def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
):
    invoice = db.query(InvoiceDB).filter(InvoiceDB.id == invoice_id).first()

    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")

    db.delete(invoice)
    db.commit()

    return {"message": "Invoice deleted successfully"}


# --------- APPROVE INVOICE ---------
@app.post("/invoices/{invoice_id}/approve", response_model=InvoiceDetailResponse)
async def approve_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
):
    invoice = db.query(InvoiceDB).filter(InvoiceDB.id == invoice_id).first()

    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice.status = "approved"

    db.commit()
    db.refresh(invoice)

    return invoice


@app.post(
    "/invoices/{invoice_id}/journal",
    response_model=JournalEntryResponse,
)
async def create_journal(
    invoice_id: int,
    db: Session = Depends(get_db),
):
    invoice = db.query(InvoiceDB).filter(InvoiceDB.id == invoice_id).first()

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


# --------- FILE UPLOAD ---------
@app.post("/upload")
async def upload_invoice(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if file.filename is None:
        raise HTTPException(
            status_code=400,
            detail="Filnamn saknas.",
        )

    filepath = INVOICE_UPLOAD_FOLDER / file.filename

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    raw_text = extract_text_from_pdf(filepath)
    invoice_data = extract_invoice_data(raw_text)

    invoice = InvoiceDB(
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


@app.post(
    "/statements/upload",
    response_model=StatementUploadResponse,
)
async def upload_statement(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if file.filename is None:
        raise HTTPException(
            status_code=400,
            detail="Filnamn saknas.",
        )

    filename = file.filename
    filepath = STATEMENT_UPLOAD_FOLDER / filename

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    statement = StatementDB(
        filename=filename,
    )

    db.add(statement)
    db.commit()
    db.refresh(statement)

    text = extract_text(str(filepath))

    transactions = parse_transactions(text)

    save_transactions(
        db=db,
        statement_id=statement.id,
        transactions=transactions,
    )

    return StatementUploadResponse(
        id=int(statement.id),
        filename=filename,
        message="Kontoutdrag uppladdat.",
    )


@app.get("/transactions")
def read_transactions(db: Session = Depends(get_db)):
    return db.query(TransactionDB).all()


from app.services.matching import match_transactions


@app.post("/match")
def run_matching(db: Session = Depends(get_db)):
    matches = match_transactions(db)

    return {"matches": matches}


@app.get("/dashboard", response_model=DashboardResponse)
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
