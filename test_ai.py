from app.services.ocr import extract_text_from_pdf
from app.services.ai import extract_invoice_data

raw_text = extract_text_from_pdf("uploads/783126 (1).pdf")

result = extract_invoice_data(raw_text)

print(result)