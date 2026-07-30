# uvicorn app.main:app --reload
# http://127.0.0.1:8000/docs

import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from app.routers import invoices
from app.routers import dashboard
from app.routers import statements
from app.routers import transactions
from app.routers import auth

# --------- LOAD ENV ---------
load_dotenv()


# --------- OPENAI CLIENT ---------
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --------- FASTAPI APP ---------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(invoices.router)


# --------- REQUEST MODEL ---------
class ParseRequest(BaseModel):
    text: str


app.include_router(dashboard.router)

app.include_router(statements.router)

app.include_router(transactions.router)

app.include_router(auth.router)
