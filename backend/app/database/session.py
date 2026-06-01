"""
Database session configuration.
Loads DATABASE_URL from .env using python-dotenv.
Configured for Neon PostgreSQL (SSL, connection pooling).
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Resolve .env path relative to this file: app/database/ -> app/ -> backend/ -> .env
_env_path = os.path.join(
    os.path.dirname(  # backend/
        os.path.dirname(  # app/
            os.path.dirname(os.path.abspath(__file__))  # database/
        )
    ),
    ".env"
)
load_dotenv(dotenv_path=_env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. "
        "Make sure backend/.env exists and contains DATABASE_URL."
    )

# Strip channel_binding param — psycopg2 doesn't support it, Neon adds it
# but it's handled at the TLS layer automatically
_db_url = DATABASE_URL.replace("&channel_binding=require", "").replace("?channel_binding=require&", "?")

engine = create_engine(
    _db_url,
    pool_pre_ping=True,   # ping before using a connection (handles Neon auto-suspend)
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
