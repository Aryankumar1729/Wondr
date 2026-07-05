from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.sql import func
from app.db.database import Base

class TripRecord(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String, index=True)
    destination = Column(String, index=True)
    departure_date = Column(String)
    arrival_date = Column(String)
    adults = Column(Integer)
    budget = Column(Float)
    
    # Store the entire complex nested structure as JSON
    trip_data = Column(JSON)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
