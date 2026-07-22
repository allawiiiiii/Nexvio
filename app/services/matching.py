from sqlalchemy.orm import Session

from app.models import InvoiceDB, TransactionDB


def match_transactions(db: Session) -> int:
    """
    Match unpaid invoices with unmatched transactions.
    Returns the number of matches.
    """

    matches = 0

    invoices = db.query(InvoiceDB).filter(InvoiceDB.paid == False).all()

    transactions = (
        db.query(TransactionDB).filter(TransactionDB.status == "unmatched").all()
    )

    for invoice in invoices:
        for transaction in transactions:

            if abs(transaction.amount) != invoice.total_amount:
                continue

            invoice.paid = True
            invoice.paid_date = transaction.date

            transaction.status = "matched"
            transaction.matched_invoice_id = invoice.id

            matches += 1
            break

    db.commit()

    return matches
