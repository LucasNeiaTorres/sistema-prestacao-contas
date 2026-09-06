from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

ORACLE_HOST = os.getenv("ORACLE_HOST")
ORACLE_PORT = os.getenv("ORACLE_PORT")
ORACLE_DATABASE = os.getenv("ORACLE_DATABASE")
ORACLE_USER = os.getenv("ORACLE_USER")
ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD")

# SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.sqlite"
SQLALCHEMY_DATABASE_URL = f"oracle+cx_oracle://{ORACLE_USER}:{ORACLE_PASSWORD}@{ORACLE_HOST}:{ORACLE_PORT}/?service_name={ORACLE_DATABASE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # connect_args={"check_same_thread": False},  # apenas para sqlite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

#no Oracle, o ORM cria as tabelas de forma 'lazily'
Base.metadata.create_all(bind=engine)
SessionLocal().commit()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
