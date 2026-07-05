from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import TripRecord
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

class TripCreate(BaseModel):
    origin: str
    destination: str
    departure_date: str
    arrival_date: str
    adults: int
    budget: float
    trip_data: Dict[str, Any]

@router.post("/")
async def save_trip(trip: TripCreate, db: AsyncSession = Depends(get_db)):
    db_trip = TripRecord(
        origin=trip.origin,
        destination=trip.destination,
        departure_date=trip.departure_date,
        arrival_date=trip.arrival_date,
        adults=trip.adults,
        budget=trip.budget,
        trip_data=trip.trip_data
    )
    db.add(db_trip)
    await db.commit()
    await db.refresh(db_trip)
    return {"status": "success", "id": db_trip.id}

@router.get("/")
async def get_trips(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TripRecord).order_by(TripRecord.created_at.desc()))
    trips = result.scalars().all()
    return {"status": "success", "data": trips}

@router.get("/{trip_id}")
async def get_trip(trip_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TripRecord).where(TripRecord.id == trip_id))
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"status": "success", "data": trip}
