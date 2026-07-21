from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class InvoiceDB(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)

    # File information
    filename = Column(String, nullable=True)

    # Workflow
    status = Column(String, default="uploaded")

    # AI extraction
    supplier = Column(String)
    invoice_number = Column(String, nullable=True)
    invoice_date = Column(String, nullable=True)

    total_amount = Column(Float)
    vat_amount = Column(Float)

    category = Column(String, nullable=True)
    confidence = Column(Float, default=0.0)

    raw_text = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)


class JournalEntryDB(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)

    invoice_id = Column(
        Integer,
        ForeignKey("invoices.id"),
        nullable=False,
    )

    status = Column(String, default="draft")

    invoice = relationship("InvoiceDB")

    lines = relationship(
        "JournalLineDB",
        back_populates="entry",
        cascade="all, delete-orphan",
    )


class JournalLineDB(Base):
    __tablename__ = "journal_lines"

    id = Column(Integer, primary_key=True, index=True)

    journal_entry_id = Column(
        Integer,
        ForeignKey("journal_entries.id"),
        nullable=False,
    )

    account = Column(String, nullable=False)

    description = Column(String)

    debit = Column(Float, default=0)

    credit = Column(Float, default=0)

    entry = relationship(
        "JournalEntryDB",
        back_populates="lines",
    )