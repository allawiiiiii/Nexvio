from pydantic import BaseModel
from typing import Optional


class InvoiceResponse(BaseModel):

    id: int
    filename: str | None
    status: str

    supplier: str
    invoice_number: str | None
    invoice_date: str | None

    total_amount: float
    vat_amount: float

    category: str | None
    confidence: float

    class Config:
        from_attributes = True


class InvoiceDetailResponse(InvoiceResponse):
    raw_text: str | None
    ai_summary: str | None


class InvoiceUpdate(BaseModel):
    supplier: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None

    total_amount: Optional[float] = None
    vat_amount: Optional[float] = None

    category: Optional[str] = None
    ai_summary: Optional[str] = None


class JournalLineResponse(BaseModel):
    id: int
    account: str
    description: str | None

    debit: float
    credit: float

    class Config:
        from_attributes = True


class JournalEntryResponse(BaseModel):
    id: int

    invoice_id: int
    status: str

    lines: list[JournalLineResponse]

    class Config:
        from_attributes = True