from app.services.ocr import extract_text_from_pdf

text = extract_text_from_pdf("uploads/783126 (1).pdf")

print(text[:2000])
