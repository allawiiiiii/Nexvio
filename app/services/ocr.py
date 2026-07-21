import fitz  # PyMuPDF


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract all text from a PDF file.

    Args:
        file_path: Path to the PDF file.

    Returns:
        A single string containing all extracted text.
    """
    text = []

    with fitz.open(file_path) as pdf:
        for page in pdf:
            page_text = page.get_text("text")

            if page_text:
                text.append(page_text)

    return "\n".join(text).strip()
