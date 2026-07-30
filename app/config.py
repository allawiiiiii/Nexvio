from pathlib import Path

UPLOAD_FOLDER = Path("uploads")

INVOICE_UPLOAD_FOLDER = UPLOAD_FOLDER / "invoices"
STATEMENT_UPLOAD_FOLDER = UPLOAD_FOLDER / "statements"

INVOICE_UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
STATEMENT_UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
