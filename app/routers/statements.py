import hashlib
from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.config import STATEMENT_UPLOAD_FOLDER
from app.core.security import get_current_user
from app.database import get_db
from app.models import StatementDB, UserDB
from app.schemas import StatementUploadResponse
from app.services.statement_parser import (
    extract_text,
    parse_transactions,
    save_transactions,
)

router = APIRouter(
    prefix="/statements",
    tags=["Statements"],
)


@router.post(
    "upload",
    response_model=StatementUploadResponse,
)
async def upload_statement(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    if file.filename is None:
        raise HTTPException(
            status_code=400,
            detail="Filnamn saknas.",
        )

    file_bytes = await file.read()

    file_hash = hashlib.sha256(file_bytes).hexdigest()

    existing = (
        db.query(StatementDB)
        .filter(
            StatementDB.file_hash == file_hash,
            StatementDB.user_id == current_user.id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Det här kontoutdraget har redan importerats.",
        )

    filename = file.filename
    extension = Path(filename).suffix
    filepath = STATEMENT_UPLOAD_FOLDER / f"{file_hash}{extension}"
    with open(filepath, "wb") as buffer:
        buffer.write(file_bytes)

    statement = StatementDB(
        user_id=current_user.id,
        filename=filename,
        file_hash=file_hash,
    )

    db.add(statement)
    db.commit()
    db.refresh(statement)

    text = extract_text(str(filepath))

    transactions = parse_transactions(text)

    save_transactions(
        db=db,
        statement_id=statement.id,
        transactions=transactions,
    )

    return StatementUploadResponse(
        id=int(statement.id),
        filename=filename,
        message="Kontoutdrag uppladdat.",
    )
