import pdfplumber
import re
from sqlalchemy.orm import Session
from app.models import TransactionDB


def parse_transactions(text: str) -> list[dict]:
    transactions = []

    pattern = re.compile(
        r"(\d{4}-\d{2}-\d{2})\s+"  # Bokf. datum
        r"\d{4}-\d{2}-\d{2}\s+"  # Tran. datum
        r"\d{4}-\d{2}-\d{2}\s+"  # Valutadatum
        r"(.+?)\s+"  # Beskrivning
        r"(-?[\d ]+,\d{2})\s+"  # Belopp
        r"([\d ]+,\d{2})"  # Saldo
    )

    for match in pattern.finditer(text):
        date, description, amount, balance = match.groups()

        amount = float(amount.replace(" ", "").replace(",", "."))

        balance = float(balance.replace(" ", "").replace(",", "."))

        transactions.append(
            {
                "date": date,
                "description": description.strip(),
                "amount": amount,
                "balance": balance,
            }
        )

    return transactions


def save_transactions(
    db: Session,
    statement_id: int,
    transactions: list[dict],
) -> None:
    """
    Save parsed transactions to the database.
    """

    for transaction in transactions:
        db.add(
            TransactionDB(
                statement_id=statement_id,
                date=transaction["date"],
                description=transaction["description"],
                amount=transaction["amount"],
                balance=transaction["balance"],
                currency="SEK",
                status="unmatched",
            )
        )

    db.commit()


def extract_text(pdf_path: str) -> str:
    """
    Extract all text from a bank statement PDF.
    """
    pages = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()

            if text:
                pages.append(text)

    return "\n".join(pages)


if __name__ == "__main__":
    text = extract_text("uploads/statements/Transaktioner_2026-07-22_00-39-28.pdf")

    print(text)
