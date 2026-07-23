from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Ladda miljövariabler från .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Make sure it exists in your .env file."
    )

# Skapa SQLAlchemy-engine
engine = create_engine(DATABASE_URL)

# Skapa sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Bas-klass för modeller
Base = declarative_base()


# Dependency för FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
