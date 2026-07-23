from sqlalchemy import (
    Integer,
    String,
    Float,
    Text,
    ForeignKey,
    Boolean,
    DateTime,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .database import Base
from datetime import datetime


class InvoiceDB(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # File information
    filename: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String,
        default="uploaded",
    )

    supplier: Mapped[str] = mapped_column(
        String,
    )

    category: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        default=0.0,
    )

    raw_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    ai_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    paid: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    paid_date: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    invoice_number: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    invoice_date: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    total_amount: Mapped[float] = mapped_column(
        Float,
    )

    vat_amount: Mapped[float] = mapped_column(
        Float,
    )

    journal_entries: Mapped[list["JournalEntryDB"]] = relationship(
        back_populates="invoice",
    )

    transactions: Mapped[list["TransactionDB"]] = relationship(
        back_populates="invoice",
    )


class JournalEntryDB(Base):
    __tablename__ = "journal_entries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    invoice_id: Mapped[int] = mapped_column(
        ForeignKey("invoices.id"),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String,
        default="draft",
    )

    invoice: Mapped["InvoiceDB"] = relationship(
        back_populates="journal_entries",
    )

    lines: Mapped[list["JournalLineDB"]] = relationship(
        back_populates="entry",
        cascade="all, delete-orphan",
    )


class JournalLineDB(Base):
    __tablename__ = "journal_lines"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    journal_entry_id: Mapped[int] = mapped_column(
        ForeignKey("journal_entries.id"),
        nullable=False,
    )

    account: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    debit: Mapped[float] = mapped_column(
        Float,
        default=0,
    )

    credit: Mapped[float] = mapped_column(
        Float,
        default=0,
    )

    entry: Mapped["JournalEntryDB"] = relationship(
        back_populates="lines",
    )


class StatementDB(Base):
    __tablename__ = "statements"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    filename: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    file_hash: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    bank_name: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    period_start: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    period_end: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    transactions: Mapped[list["TransactionDB"]] = relationship(
        back_populates="statement",
        cascade="all, delete-orphan",
    )


class TransactionDB(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    statement_id: Mapped[int] = mapped_column(
        ForeignKey("statements.id"),
        nullable=False,
    )

    date: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    amount: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    balance: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    currency: Mapped[str] = mapped_column(
        String,
        default="SEK",
    )

    status: Mapped[str] = mapped_column(
        String,
        default="unmatched",
    )

    matched_invoice_id: Mapped[int | None] = mapped_column(
        ForeignKey("invoices.id"),
        nullable=True,
    )

    statement: Mapped["StatementDB"] = relationship(
        back_populates="transactions",
    )

    invoice: Mapped["InvoiceDB"] = relationship(
        back_populates="transactions",
    )
