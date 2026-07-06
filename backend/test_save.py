import asyncio
from app.db.database import AsyncSessionLocal
from app.db.models import TripRecord

async def main():
    try:
        async with AsyncSessionLocal() as session:
            db_trip = TripRecord(
                origin="A",
                destination="B",
                departure_date="2026",
                arrival_date="2026",
                adults=1,
                budget=1.0,
                trip_data={"test": "ok"}
            )
            session.add(db_trip)
            await session.commit()
            print("SUCCESS")
    except Exception as e:
        print("ERROR:", e)

asyncio.run(main())
