# 🛠️ VACAY Production Readiness - Implementation Guide

**Complete Step-by-Step Fixes for All Critical Issues**

---

## Phase 1: Authentication & Security (Days 1-4)

### Step 1.1: Install Authentication Libraries

```bash
# Terminal
cd backend
pip install fastapi-jwt-extended[asymmetric-crypto] python-multipart
pip install passlib[bcrypt] python-jose[cryptography]
pip install python-dotenv  # Already have this
pip freeze > requirements.txt
```

---

### Step 1.2: Create Authentication Module

**File: `backend/app/auth/security.py`**

```python
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# Configuration
SECRET_KEY = "your-secret-key-change-in-production"  # ← Change in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TokenData(BaseModel):
    sub: str
    exp: datetime
    user_id: str

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return {"user_id": user_id}
    except jwt.InvalidTokenError:
        return None
```

---

### Step 1.3: Create User Model

**File: `backend/app/db/models.py`** (Add to existing file)

```python
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TripRecord(Base):
    # Add user_id to existing table
    user_id = Column(String, ForeignKey("users.id"), index=True)  # ← ADD THIS LINE
    # ... rest of existing fields ...
```

---

### Step 1.4: Create Auth API Endpoints

**File: `backend/app/api/auth.py`** (New file)

```python
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta
import uuid

from app.db.database import get_db
from app.db.models import User
from app.models.schemas import AuthRequest, AuthResponse
from app.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter()

@router.post("/register", response_model=AuthResponse)
async def register(request: AuthRequest, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user = User(
        id=str(uuid.uuid4()),
        email=request.email,
        hashed_password=hash_password(request.password),
        full_name=request.full_name or ""
    )
    db.add(user)
    await db.commit()
    
    # Generate token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id
    )

@router.post("/login", response_model=AuthResponse)
async def login(request: AuthRequest, db: AsyncSession = Depends(get_db)):
    # Find user
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalars().first()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id
    )

@router.post("/refresh")
async def refresh_token(token: str):
    # Validate refresh token and issue new access token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    new_token = create_access_token(
        data={"sub": payload["user_id"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": new_token, "token_type": "bearer"}
```

---

### Step 1.5: Add Dependency for Protected Routes

**File: `backend/app/auth/dependencies.py`** (New file)

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from app.auth.security import decode_token

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> str:
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return user_id
```

---

### Step 1.6: Update Main App to Include Auth

**File: `backend/app/main.py`** (Update)

```python
from app.api import chat, destinations, itinerary, weather, health, logistics, orchestration, trips, explore, auth

# Add auth router
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Update existing protected routes
app.include_router(trips.router, prefix="/api/trips", tags=["trips"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
# etc.
```

---

## Phase 2: Error Handling & Validation (Days 2-4)

### Step 2.1: Create Exception Handlers

**File: `backend/app/exceptions.py`** (New file)

```python
from fastapi import status
import logging

logger = logging.getLogger(__name__)

class VacayException(Exception):
    """Base exception for all Vacay errors"""
    def __init__(self, message: str, status_code: int = 400, error_code: str = "UNKNOWN_ERROR"):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(message)

class ValidationException(VacayException):
    def __init__(self, message: str):
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY, "VALIDATION_ERROR")

class AuthenticationException(VacayException):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED, "AUTHENTICATION_ERROR")

class AuthorizationException(VacayException):
    def __init__(self, message: str = "Not authorized"):
        super().__init__(message, status.HTTP_403_FORBIDDEN, "AUTHORIZATION_ERROR")

class ResourceNotFoundException(VacayException):
    def __init__(self, resource: str, resource_id: str):
        message = f"{resource} with id {resource_id} not found"
        super().__init__(message, status.HTTP_404_NOT_FOUND, "RESOURCE_NOT_FOUND")

class ExternalServiceException(VacayException):
    def __init__(self, service: str, message: str):
        full_message = f"Service {service} failed: {message}"
        super().__init__(full_message, status.HTTP_503_SERVICE_UNAVAILABLE, f"SERVICE_{service.upper()}_ERROR")

class RateLimitException(VacayException):
    def __init__(self):
        super().__init__("Rate limit exceeded", status.HTTP_429_TOO_MANY_REQUESTS, "RATE_LIMIT_EXCEEDED")

class DatabaseException(VacayException):
    def __init__(self, message: str):
        super().__init__(message, status.HTTP_500_INTERNAL_SERVER_ERROR, "DATABASE_ERROR")
```

---

### Step 2.2: Add Global Exception Handlers

**File: `backend/app/main.py`** (Add after app initialization)

```python
from fastapi.responses import JSONResponse
from fastapi import Request
from app.exceptions import VacayException
import logging

logger = logging.getLogger(__name__)

@app.exception_handler(VacayException)
async def vacay_exception_handler(request: Request, exc: VacayException):
    logger.error(f"Vacay exception: {exc.error_code} - {exc.message}", extra={
        "path": request.url.path,
        "method": request.method,
        "status_code": exc.status_code,
        "error_code": exc.error_code
    })
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "error_code": exc.error_code,
            "request_id": request.headers.get("x-request-id", "unknown")
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {type(exc).__name__}: {exc}", exc_info=True, extra={
        "path": request.url.path,
        "method": request.method
    })
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "error_code": "INTERNAL_SERVER_ERROR",
            "request_id": request.headers.get("x-request-id", "unknown")
        }
    )
```

---

### Step 2.3: Update Schemas with Strong Validation

**File: `backend/app/models/schemas.py`** (Add/Update)

```python
from pydantic import BaseModel, Field, validator, field_validator
from datetime import date, datetime, timedelta
from typing import Optional

# Auth Schemas
class AuthRequest(BaseModel):
    email: str = Field(..., regex=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    password: str = Field(..., min_length=8, max_length=128)
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str

# Trip Schemas
class PlanRequest(BaseModel):
    origin: str = Field(..., min_length=2, max_length=100)
    destination: str = Field(..., min_length=2, max_length=100)
    date: date = Field(...)
    duration: int = Field(default=2, ge=1, le=30)
    adults: int = Field(default=1, ge=1, le=10)
    children: int = Field(default=0, ge=0, le=10)
    budget: float = Field(default=50000.0, ge=5000, le=100000000)
    
    @field_validator('date')
    @classmethod
    def validate_date(cls, v):
        if v < date.today():
            raise ValueError('Departure date cannot be in the past')
        if v > date.today() + timedelta(days=365):
            raise ValueError('Departure date cannot be more than 1 year away')
        return v
    
    @field_validator('origin', 'destination')
    @classmethod
    def validate_location(cls, v):
        if not v.replace(" ", "").replace("-", "").isalpha():
            raise ValueError('Location must contain only letters, spaces, or hyphens')
        return v.strip()

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    conversation_history: list = Field(default_factory=list, max_length=50)
    
    @field_validator('message')
    @classmethod
    def validate_message(cls, v):
        if len(v.strip()) == 0:
            raise ValueError('Message cannot be empty or only whitespace')
        return v.strip()

class ChatResponse(BaseModel):
    reply: str
    sources: list[str] = Field(default_factory=list)
```

---

## Phase 3: Database Migration to PostgreSQL (Days 3-4)

### Step 3.1: Create Docker Compose File

**File: `backend/docker-compose.yml`** (New file)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: vacay_user
      POSTGRES_PASSWORD: vacay_secure_password_change_me
      POSTGRES_DB: vacay
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vacay_user -d vacay"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - vacay_network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - vacay_network

volumes:
  postgres_data:
  redis_data:

networks:
  vacay_network:
    driver: bridge
```

---

### Step 3.2: Update Database Configuration

**File: `backend/app/db/database.py`** (Replace)

```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Use PostgreSQL URL from environment
DATABASE_URL = settings.database_url or "postgresql+asyncpg://vacay_user:vacay_secure_password_change_me@localhost:5432/vacay"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=20,  # Connection pool size
    max_overflow=10,  # Overflow connections
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_pre_ping=True,  # Test connections before using
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

Base = declarative_base()

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database error: {e}", exc_info=True)
            raise
        finally:
            await session.close()

async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized")

async def close_db():
    """Close database connection pool"""
    await engine.dispose()
    logger.info("Database connection pool closed")
```

---

### Step 3.3: Update Config to Include Database URL

**File: `backend/app/config.py`** (Update)

```python
import os
from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://vacay_user:vacay_secure_password_change_me@localhost:5432/vacay",
        alias="DATABASE_URL"
    )
    
    # Cache/Redis
    redis_url: str = Field(default="redis://localhost:6379", alias="REDIS_URL")
    
    # API Keys
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    
    # Server
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    debug: bool = Field(default=False, alias="DEBUG")
    
    # Auth
    secret_key: str = Field(default="change-me-in-production", alias="SECRET_KEY")
    algorithm: str = Field(default="HS256")
    
    # CORS
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
```

---

### Step 3.4: Create Migration Script

**File: `backend/migrate.py`** (New file)

```python
import asyncio
from app.db.database import init_db, engine

async def main():
    await init_db()
    print("✅ Database migration complete")

if __name__ == "__main__":
    asyncio.run(main())
```

**Run migrations:**
```bash
python migrate.py
```

---

## Phase 4: Rate Limiting & Logging (Days 3-5)

### Step 4.1: Add Rate Limiting

**File: `backend/app/middleware/rate_limiter.py`** (New file)

```python
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

limiter = Limiter(key_func=get_remote_address)

async def rate_limit_error_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"error": "Rate limit exceeded", "error_code": "RATE_LIMIT_EXCEEDED"}
    )
```

---

### Step 4.2: Apply Rate Limiting to Endpoints

**File: `backend/app/main.py`** (Add)

```python
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# Exception handler for rate limits
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "error_code": "RATE_LIMIT_EXCEEDED",
            "retry_after": 60
        }
    )

# Apply limits to endpoints
from slowapi import depends_on_rate_limit_exceeded
```

**Apply to specific routes:**

```python
# In app/api/chat.py
from app.main import limiter

@router.post("/", response_model=ChatResponse)
@limiter.limit("100/hour")  # 100 chats per hour per IP
async def chat_endpoint(request: Request, chat_req: ChatRequest):
    pass

# In app/api/orchestration.py
@router.post("/stream")
@limiter.limit("10/minute")  # 10 plans per minute per IP
async def stream_orchestration(request: Request, plan_req: PlanRequest):
    pass
```

---

### Step 4.3: Add Comprehensive Logging

**File: `backend/app/logging_config.py`** (New file)

```python
import logging
import logging.config
import json
from datetime import datetime

# JSON formatter for structured logs
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data)

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
        "json": {
            "()": JSONFormatter,
        }
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr",
        },
        "json": {
            "formatter": "json",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "": {
            "handlers": ["json"],
            "level": "INFO",
        },
        "uvicorn": {
            "handlers": ["default"],
        },
    },
}

def setup_logging():
    logging.config.dictConfig(LOGGING_CONFIG)
```

---

### Step 4.4: Add Request/Response Logging Middleware

**File: `backend/app/middleware/logging_middleware.py`** (New file)

```python
import time
import logging
import uuid
from fastapi import Request

logger = logging.getLogger(__name__)

async def logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    start_time = time.time()
    
    logger.info({
        "event": "request_started",
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "query": str(request.url.query),
        "client": request.client.host if request.client else "unknown",
    })
    
    try:
        response = await call_next(request)
    except Exception as e:
        duration = time.time() - start_time
        logger.error({
            "event": "request_error",
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "duration_ms": duration * 1000,
            "error": str(e),
            "error_type": type(e).__name__,
        }, exc_info=True)
        raise
    
    duration = time.time() - start_time
    logger.info({
        "event": "request_completed",
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration_ms": duration * 1000,
    })
    
    response.headers["X-Request-ID"] = request_id
    return response
```

---

## Phase 5: Update Protected APIs (Days 5-6)

### Step 5.1: Update Trips API

**File: `backend/app/api/trips.py`** (Complete Rewrite)

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from datetime import date
from typing import Optional

from app.db.database import get_db
from app.db.models import TripRecord
from app.auth.dependencies import get_current_user
from app.models.schemas import TripCreate, TripUpdate
from app.exceptions import ResourceNotFoundException, DatabaseException
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/")
async def save_trip(
    trip: TripCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Save a new trip"""
    try:
        db_trip = TripRecord(
            user_id=current_user,
            origin=trip.origin,
            destination=trip.destination,
            departure_date=trip.departure_date,
            arrival_date=trip.arrival_date,
            adults=trip.adults,
            budget=trip.budget,
            trip_data=trip.trip_data,
            status="draft"
        )
        db.add(db_trip)
        await db.commit()
        await db.refresh(db_trip)
        
        logger.info({
            "event": "trip_created",
            "trip_id": db_trip.id,
            "user_id": current_user,
            "destination": trip.destination
        })
        
        return {"status": "success", "id": db_trip.id}
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to save trip: {e}", exc_info=True)
        raise DatabaseException(f"Failed to save trip: {str(e)}")

@router.get("/")
async def get_trips(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    destination: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
):
    """Get all trips for current user with filtering"""
    try:
        query = select(TripRecord).where(
            and_(
                TripRecord.user_id == current_user,
                TripRecord.is_deleted == False
            )
        )
        
        if destination:
            query = query.where(TripRecord.destination.ilike(f"%{destination}%"))
        if date_from:
            query = query.where(TripRecord.departure_date >= date_from)
        if date_to:
            query = query.where(TripRecord.departure_date <= date_to)
        
        result = await db.execute(
            query.order_by(TripRecord.created_at.desc()).offset(skip).limit(limit)
        )
        trips = result.scalars().all()
        
        # Get total count
        count_result = await db.execute(
            select(TripRecord).where(TripRecord.user_id == current_user)
        )
        total = len(count_result.scalars().all())
        
        return {
            "status": "success",
            "data": trips,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        logger.error(f"Failed to get trips: {e}", exc_info=True)
        raise DatabaseException(f"Failed to get trips: {str(e)}")

@router.get("/{trip_id}")
async def get_trip(
    trip_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get a specific trip"""
    try:
        result = await db.execute(
            select(TripRecord).where(
                and_(
                    TripRecord.id == trip_id,
                    TripRecord.user_id == current_user,
                    TripRecord.is_deleted == False
                )
            )
        )
        trip = result.scalars().first()
        if not trip:
            raise ResourceNotFoundException("Trip", trip_id)
        return {"status": "success", "data": trip}
    except Exception as e:
        logger.error(f"Failed to get trip {trip_id}: {e}", exc_info=True)
        raise

@router.put("/{trip_id}")
async def update_trip(
    trip_id: int,
    update: TripUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update a trip"""
    try:
        result = await db.execute(
            select(TripRecord).where(
                and_(
                    TripRecord.id == trip_id,
                    TripRecord.user_id == current_user
                )
            )
        )
        trip = result.scalars().first()
        if not trip:
            raise ResourceNotFoundException("Trip", trip_id)
        
        # Update fields
        for key, value in update.dict(exclude_unset=True).items():
            setattr(trip, key, value)
        
        await db.commit()
        await db.refresh(trip)
        
        logger.info({
            "event": "trip_updated",
            "trip_id": trip_id,
            "user_id": current_user
        })
        
        return {"status": "success", "data": trip}
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update trip {trip_id}: {e}", exc_info=True)
        raise

@router.delete("/{trip_id}")
async def delete_trip(
    trip_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Soft delete a trip"""
    try:
        result = await db.execute(
            select(TripRecord).where(
                and_(
                    TripRecord.id == trip_id,
                    TripRecord.user_id == current_user
                )
            )
        )
        trip = result.scalars().first()
        if not trip:
            raise ResourceNotFoundException("Trip", trip_id)
        
        trip.is_deleted = True
        await db.commit()
        
        logger.info({
            "event": "trip_deleted",
            "trip_id": trip_id,
            "user_id": current_user
        })
        
        return {"status": "success", "message": "Trip deleted"}
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to delete trip {trip_id}: {e}", exc_info=True)
        raise

@router.get("/search/query")
async def search_trips(
    q: str = Query(..., min_length=1, max_length=100),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Search trips by destination or origin"""
    try:
        from html import escape
        q_safe = escape(q)
        
        result = await db.execute(
            select(TripRecord).where(
                and_(
                    TripRecord.user_id == current_user,
                    TripRecord.is_deleted == False,
                    (TripRecord.destination.ilike(f"%{q_safe}%")) |
                    (TripRecord.origin.ilike(f"%{q_safe}%"))
                )
            ).limit(20)
        )
        trips = result.scalars().all()
        return {"status": "success", "data": trips}
    except Exception as e:
        logger.error(f"Search failed: {e}", exc_info=True)
        raise
```

---

## Phase 6: Update Protected APIs (Continued)

### Step 6.1: Update Chat API with Auth

**File: `backend/app/api/chat.py`** (Update)

```python
from fastapi import APIRouter, Depends, Request
from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import llm_service
from app.auth.dependencies import get_current_user
from app.exceptions import ExternalServiceException
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    current_user: str = Depends(get_current_user),
    http_request: Request = None
):
    try:
        logger.info({
            "event": "chat_started",
            "user_id": current_user,
            "request_id": http_request.state.request_id if hasattr(http_request, 'state') else None
        })
        
        history = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history]
        reply = await llm_service.chat(request.message, history)
        
        logger.info({
            "event": "chat_completed",
            "user_id": current_user,
            "response_length": len(reply)
        })
        
        return ChatResponse(reply=reply)
    except Exception as e:
        logger.error(f"Chat failed: {e}", exc_info=True)
        raise ExternalServiceException("LLM", str(e))
```

---

## Phase 7: Update Orchestration with State Persistence (Days 6-7)

### Step 7.1: Create State Service

**File: `backend/app/services/state_service.py`** (New file)

```python
import redis.asyncio as redis
import json
from datetime import timedelta
from app.config import settings

class StateService:
    def __init__(self):
        self.redis = None
    
    async def init(self):
        """Initialize Redis connection"""
        self.redis = await redis.from_url(settings.redis_url)
    
    async def save_state(self, orchestration_id: str, agent_name: str, state: dict, ttl_minutes: int = 60):
        """Save agent state"""
        key = f"orchestration:{orchestration_id}:{agent_name}"
        await self.redis.setex(
            key,
            timedelta(minutes=ttl_minutes),
            json.dumps(state)
        )
    
    async def get_state(self, orchestration_id: str, agent_name: str):
        """Get saved state"""
        key = f"orchestration:{orchestration_id}:{agent_name}"
        data = await self.redis.get(key)
        return json.loads(data) if data else None
    
    async def delete_state(self, orchestration_id: str):
        """Delete all state for orchestration"""
        pattern = f"orchestration:{orchestration_id}:*"
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)

state_service = StateService()
```

---

### Step 7.2: Update Orchestrator to Use State Service

**File: `backend/app/agents/orchestrator.py`** (Update)

```python
import asyncio
import json
import hashlib
import uuid
from datetime import datetime
from typing import AsyncGenerator
import logging

from app.agents.base_agent import ADKAgent
from app.agents.flight_agent import FlightAgent
from app.agents.hotel_agent import HotelAgent
from app.agents.itinerary_agent import ItineraryAgent
from app.agents.budget_agent import BudgetAgent
from app.agents.weather_agent import WeatherAgent
from app.agents.packing_agent import PackingAgent
from app.services.state_service import state_service

logger = logging.getLogger(__name__)

class OrchestratorAgent(ADKAgent):
    def __init__(self):
        super().__init__("OrchestratorAgent")
        self.flight_agent = FlightAgent()
        self.hotel_agent = HotelAgent()
        self.itinerary_agent = ItineraryAgent()
        self.budget_agent = BudgetAgent()
        self.weather_agent = WeatherAgent()
        self.packing_agent = PackingAgent()

    async def stream_plan(self, request_payload: dict) -> AsyncGenerator[str, None]:
        orchestration_id = str(uuid.uuid4())
        
        logger.info({
            "event": "orchestration_started",
            "orchestration_id": orchestration_id,
            "destination": request_payload.get("destination")
        })
        
        yield f"data: {json.dumps({'event': 'orchestration_started', 'orchestration_id': orchestration_id})}\n\n"
        
        try:
            # Phase 1: Run Weather, Flights, and Hotels IN PARALLEL
            yield f"data: {json.dumps({'event': 'phase_1_started'})}\n\n"
            
            weather_result, flight_result, hotel_result = await asyncio.gather(
                self.send_message(self.weather_agent, request_payload),
                self.send_message(self.flight_agent, request_payload),
                self.send_message(self.hotel_agent, request_payload),
            )
            
            # Save phase 1 state
            await state_service.save_state(
                orchestration_id,
                "phase_1",
                {"weather": weather_result, "flights": flight_result, "hotels": hotel_result}
            )
            
            yield f"data: {json.dumps({'event': 'phase_1_completed', 'result': {'weather': weather_result, 'flights': flight_result, 'hotels': hotel_result}})}\n\n"
            
            # Phase 2: Itinerary and Packing (depends on phase 1)
            yield f"data: {json.dumps({'event': 'phase_2_started'})}\n\n"
            
            phase2_payload = {
                **request_payload,
                "flights": flight_result,
                "hotels": hotel_result,
                "weather": weather_result
            }
            
            itinerary_result, packing_result = await asyncio.gather(
                self.send_message(self.itinerary_agent, phase2_payload),
                self.send_message(self.packing_agent, phase2_payload)
            )
            
            # Save phase 2 state
            await state_service.save_state(
                orchestration_id,
                "phase_2",
                {"itinerary": itinerary_result, "packing": packing_result}
            )
            
            yield f"data: {json.dumps({'event': 'phase_2_completed', 'result': {'itinerary': itinerary_result, 'packing': packing_result}})}\n\n"
            
            # Phase 3: Budget Check
            yield f"data: {json.dumps({'event': 'phase_3_started'})}\n\n"
            
            budget_payload = {**phase2_payload, "itinerary": itinerary_result, "packing": packing_result}
            budget_result = await self.send_message(self.budget_agent, budget_payload)
            
            # Save phase 3 state
            await state_service.save_state(
                orchestration_id,
                "phase_3",
                {"budget": budget_result}
            )
            
            yield f"data: {json.dumps({'event': 'orchestration_completed', 'result': budget_result})}\n\n"
            
            logger.info({
                "event": "orchestration_succeeded",
                "orchestration_id": orchestration_id,
                "duration_ms": datetime.now().timestamp()
            })
            
        except Exception as e:
            logger.error({
                "event": "orchestration_failed",
                "orchestration_id": orchestration_id,
                "error": str(e)
            }, exc_info=True)
            
            yield f"data: {json.dumps({'event': 'orchestration_error', 'error': str(e)})}\n\n"
```

---

## Next Steps Checklist

```bash
# 1. Install all dependencies
pip install -r requirements.txt

# 2. Start PostgreSQL and Redis
docker-compose up -d

# 3. Run migrations
python migrate.py

# 4. Create test user
# (Add endpoint or manual SQL)

# 5. Run tests
pytest tests/

# 6. Start server
uvicorn app.main:app --reload

# 7. Test endpoints
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

---

**Total Implementation Time: 6-8 weeks for a 2-3 person team**

**Start with Phase 1 (Auth) - it unlocks all other security improvements!**

