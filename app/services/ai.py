from openai import OpenAI
import os
import json

from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def extract_invoice_data(raw_text: str):
    response = client.responses.create(
        model="gpt-5.5",
        input=f"""
You are an expert accounting assistant.

Extract the following fields from this invoice.

Return ONLY valid JSON.

Rules:
- supplier: string
- invoice_number: string
- invoice_date: YYYY-MM-DD
- total_amount: number
- vat_amount: number
- ai_summary: string (maximum 2 short sentences)

The summary should briefly describe:
- who sent the invoice
- what the invoice is for
- the total amount

Do not include currency symbols in numeric fields.
Do not include spaces in numbers.

Do not include currency symbols.
Do not include spaces in numbers.

Fields:
- supplier
- invoice_number
- invoice_date
- total_amount
- vat_amount

Invoice:

{raw_text}
""",
    )

    return json.loads(response.output_text)


def suggest_journal_entry(invoice):
    response = client.responses.create(
        model="gpt-5.5",
        input=f"""
You are a certified Swedish accountant.

Create a Swedish BAS journal entry for this supplier invoice.

Rules:
- Use BAS account numbers.
- Separate VAT.
- Debit and credit must balance exactly.
- Return ONLY valid JSON.

JSON format:

{{
    "lines": [
        {{
            "account": "4010",
            "description": "Purchases",
            "debit": 10000,
            "credit": 0
        }},
        {{
            "account": "2641",
            "description": "Input VAT",
            "debit": 2500,
            "credit": 0
        }},
        {{
            "account": "2440",
            "description": "Accounts payable",
            "debit": 0,
            "credit": 12500
        }}
    ]
}}

Invoice

Supplier:
{invoice.supplier}

Invoice date:
{invoice.invoice_date}

Category:
{invoice.category}

Total:
{invoice.total_amount}

VAT:
{invoice.vat_amount}

Summary:
{invoice.ai_summary}
""",
    )

    return json.loads(response.output_text)
