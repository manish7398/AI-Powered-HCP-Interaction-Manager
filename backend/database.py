from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DB_USER = os.getenv("user")
    DB_PASSWORD = os.getenv("password")
    DB_HOST = os.getenv("host")
    DB_PORT = os.getenv("port")
    DB_NAME = os.getenv("dbname")
    DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Interaction(Base):
    __tablename__ = "interactions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    hcp_name = Column(String(255), nullable=False)
    specialty = Column(String(255))
    location = Column(String(255))
    interaction_date = Column(DateTime, default=datetime.now)
    interaction_type = Column(String(100))
    duration = Column(Integer, default=0)
    discussion_summary = Column(Text)
    summary = Column(Text)
    key_topics = Column(JSON)
    outcome = Column(String(255))
    next_follow_up = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class FollowUp(Base):
    __tablename__ = "followups"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    hcp_name = Column(String(255), nullable=False)
    follow_up_date = Column(DateTime, nullable=False)
    notes = Column(Text)
    completed = Column(String(10), default="pending")
    created_at = Column(DateTime, default=datetime.now)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()