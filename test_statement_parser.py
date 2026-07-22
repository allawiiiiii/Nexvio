from app.services.statement_parser import extract_text, parse_transactions

text = extract_text("uploads/statements/Transaktioner_2026-07-22_00-39-28.pdf")

transactions = parse_transactions(text)

for t in transactions:
    print(t)
