# 🏗️ VACAY Architecture & Performance Guide

## Current Architecture (What You Have)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                           │
│                    (localhost:3000)                                 │
│  - React Components                                                  │
│  - No type generation from backend                                  │
│  - Client-side validation only                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                                │
                                │ HTTP/REST + SSE
                                │
┌──────────────────────────────┴──────────────────────────────────────┐
│                     BACKEND (FastAPI)                               │
│                   (localhost:8000)                                  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              API Endpoints (NO AUTH)                        │   │
│  │  - /api/health         (basic health check)                │   │
│  │  - /api/chat           (LLM chat)                          │   │
│  │  - /api/trips          (CRUD operations)                   │   │
│  │  - /api/orchestration  (Agent orchestration / SSE)         │   │
│  │  - /api/destinations   (Search places)                     │   │
│  │  - /api/weather        (Weather forecast)                  │   │
│  │  - /api/logistics      (Flights, Hotels)                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                     │
│  ┌─────────────────────────────┴─────────────────────────────────┐  │
│  │        Multi-Agent System (Agent-to-Agent Message)            │  │
│  │                                                               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐             │  │
│  │  │FlightAgent │  │HotelAgent  │  │ItineraryA. │             │  │
│  │  └────────────┘  └────────────┘  └────────────┘             │  │
│  │                                                               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐             │  │
│  │  │WeatherA.   │  │BudgetAgent │  │PackingA.   │             │  │
│  │  └────────────┘  └────────────┘  └────────────┘             │  │
│  │                                                               │  │
│  │  Orchestrated by: OrchestratorAgent                           │  │
│  │  Communication: In-memory A2A messages                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                │                                     │
│  ┌─────────────────────────────┴─────────────────────────────────┐  │
│  │            External Services (Providers)                      │  │
│  │                                                               │  │
│  │  - Groq (LLM)         - Google Maps                          │  │
│  │  - OpenWeather        - SerpAPI (Flights/Hotels)             │  │
│  │  - Overpass (OSM)     - Duffel API                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                │                                     │
└────────────────────────────────┼─────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
        ┌───────▼────────┐          ┌──────────▼────────┐
        │   SQLite DB    │          │  In-Memory Cache  │
        │ (LOCAL FILE)   │          │  (Loses on reboot)│
        └────────────────┘          └───────────────────┘
```

**Issues with Current Architecture:**
- ❌ No authentication layer
- ❌ Agents are stateless (can't recover from failures)
- ❌ SQLite can't scale
- ❌ In-memory cache is lost on restart
- ❌ No rate limiting or throttling
- ❌ No monitoring or observability
- ❌ Tight coupling between frontend and backend

---

## Production Architecture (What You Need)

```
┌─────────────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js on Vercel)                      │
│              (https://vacay.example.com)                            │
│                                                                      │
│  - React Components (Server-side Rendering)                         │
│  - Auto-generated Types from OpenAPI                                │
│  - Form validation (duplicated from backend)                        │
│  - Stores JWT token in secure HTTP-only cookie                      │
└──────────────────────────────┬──────────────────────────────────────┘
                                │
                    ┌───────────┴──────────┐
                    │                      │
          HTTPS    │            (CDN)     │
                    │                      │
┌──────────────────┴──────────────────────┴──────────────────────────┐
│                      API GATEWAY / CLOUD RUN                        │
│                 (https://api.vacay.example.com)                     │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Middleware Stack                                          │    │
│  │  - CORS                - Request Logging                   │    │
│  │  - JWT Verification    - Request ID tracking              │    │
│  │  - Rate Limiting       - Error Handling                    │    │
│  │  - Input Validation    - Response Compression             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Authenticated API Routes                      │    │
│  │  - /api/auth/*         (Register, Login, Refresh)         │    │
│  │  - /api/trips/*        (Full CRUD + Search)               │    │
│  │  - /api/chat/*         (LLM chat)                         │    │
│  │  - /api/orchestration* (Trip planning SSE)                │    │
│  │  - /api/destinations*  (POI search)                       │    │
│  │  - /api/weather*       (Weather forecast)                 │    │
│  │  - /api/logistics*     (Flights/Hotels)                   │    │
│  │  - /api/health         (Health check - no auth)           │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                │                                    │
│  ┌────────────────────────────┴────────────────────────────────┐   │
│  │      Multi-Agent System with State Persistence             │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────┐      │   │
│  │  │  Orchestrator Agent (State: Redis)              │      │   │
│  │  │  ├─ Phase 1: Weather, Flights, Hotels (parallel)│      │   │
│  │  │  ├─ Phase 2: Itinerary, Packing                 │      │   │
│  │  │  ├─ Phase 3: Budget Analysis                    │      │   │
│  │  │  └─ Save state after each phase                 │      │   │
│  │  │                                                  │      │   │
│  │  │  Sub-agents:                                     │      │   │
│  │  │  - FlightAgent        (SerpAPI)                  │      │   │
│  │  │  - HotelAgent         (SerpAPI)                  │      │   │
│  │  │  - WeatherAgent       (Open-Meteo)              │      │   │
│  │  │  - ItineraryAgent     (Groq LLM)                │      │   │
│  │  │  - BudgetAgent        (Rules engine)            │      │   │
│  │  │  - PackingAgent       (Groq LLM)                │      │   │
│  │  └──────────────────────────────────────────────────┘      │   │
│  └──────────────────────────────────────────────────────────────┘  │
│                    │                     │                         │
└────────────────────┼─────────────────────┼─────────────────────────┘
                     │                     │
        ┌────────────┴──┐      ┌──────────┴─────────┐
        │               │      │                    │
    ┌───▼────┐      ┌──▼──┐ ┌─▼──┐              ┌──▼───────────┐
    │PostgreSQL       │Redis│ │S3  │     (Cache)│   Monitoring │
    │Cluster  │      │Cache│ │Logs│            │ Sentry/NewRelic
    │(Primary+Replica)      │ │    │            └─────────────┘
    └────────┘       └─────┘ └────┘
        │                       │
    ┌───▼───────────────┬───────▼────────────┐
    │ Encrypted         │ Time-series logs   │
    │ Backups (daily)   │ (CloudWatch/Logs)  │
    └───────────────────┴────────────────────┘
```

**Improvements:**
- ✅ JWT authentication + RBAC
- ✅ Stateful agent orchestration (recoverable)
- ✅ PostgreSQL with replication (reliable, scalable)
- ✅ Redis cache (distributed, persistent)
- ✅ API Gateway with rate limiting
- ✅ Comprehensive logging (centralized, searchable)
- ✅ Error tracking (Sentry)
- ✅ Performance monitoring (New Relic/DataDog)
- ✅ Database backups (daily)
- ✅ Soft deletes (data recovery)

---

## Data Flow Diagrams

### User Trip Planning Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  User submits trip request                                       │
│  POST /api/orchestration/stream                                 │
│  {origin: "Delhi", destination: "Goa", date: "2026-10-01", ...} │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                    1. Validate Input
                    2. Check Auth Token
                    3. Check Rate Limit
                         │
        ┌────────────────┴────────────────┐
        │                                 │
    ❌ FAIL                            ✅ PASS
    (400/403/429)                        │
                                        │
                        ┌───────────────┴────────────┐
                        │ Orchestrator.stream_plan() │
                        └────────────┬────────────────┘
                                     │
        Phase 1: ┌────────────────────┼────────────────────┐
        (Parallel)                    │                    │
                    ┌────────────────┐│┌────────────────┐┌──────────────┐
                    │ FlightAgent    ││ HotelAgent     ││ WeatherAgent │
                    │  (SerpAPI)     ││  (SerpAPI)     ││ (Open-Meteo) │
                    └─┬──────────────┘└─┬───────────────┘└──────┬───────┘
                      │                  │                       │
         (Save state to Redis)           │                       │
                      └──────────────┬───┴───────────────────────┘
                                     │
        Phase 2: ┌────────────────────┼────────────────────┐
        (Parallel)                    │                    │
                    ┌────────────────┐│┌────────────────┐
                    │ItineraryAgent  ││ PackingAgent   │
                    │  (Groq LLM)    ││ (Groq LLM)     │
                    └─┬──────────────┘└─┬───────────────┘
                      │                  │
         (Save state to Redis)          │
                      └──────────────┬───┘
                                     │
        Phase 3: ┌────────────────────┴────────────────┐
        (Sequential)                                   │
                    ┌────────────────────────────────┐
                    │ BudgetAgent                    │
                    │ (Rules engine)                 │
                    └────────┬───────────────────────┘
                             │
            (Save final result to Redis)
                             │
         SSE Stream to Client │
    ┌──────────────────────────┴──────────────────────┐
    │ data: {event: 'phase_1_complete', ...}          │
    │ data: {event: 'phase_2_complete', ...}          │
    │ data: {event: 'phase_3_complete', result: ...}  │
    │ data: {event: 'orchestration_complete', ...}    │
    └──────────────────────────────────────────────────┘
             │
      ┌──────┴───────┐
      │              │
  ✅ SUCCESS     ❌ FAILURE
      │              │
   Save to DB    Log Error
   Return 200    Return 503
```

---

## Performance Baseline & Targets

### Current Performance (MVP)

| Metric | Current | Issues |
|--------|---------|--------|
| **API Response Time (p99)** | ~2-3s | Slow, blocks UI |
| **Orchestration Time** | ~5-8s | Depends on 3rd party APIs |
| **Database Query** | ~100ms | SQLite locks |
| **Cache Hit Rate** | N/A | No distributed cache |
| **Requests/Sec** | ~10 req/s | Single instance |
| **Concurrent Users** | ~50 | Connections exhaust |
| **Uptime** | Dev-only | No HA |

### Production Targets

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| **API Response Time (p99)** | <500ms | - Redis caching - Query optimization - CDN for static assets |
| **Orchestration Time** | <3s | - Parallel agent execution - Cache common requests - Precompute seasonal data |
| **Database Query (p99)** | <50ms | - PostgreSQL with indexes - Connection pooling - Query optimization |
| **Cache Hit Rate** | >80% | - Smart TTL strategy - Cache prewarming - Invalidation patterns |
| **Requests/Sec** | >1000 req/s | - Horizontal scaling (Cloud Run auto-scale) - Load balancer - Rate limiting |
| **Concurrent Users** | >500 | - Connection pooling (20-30 connections) - Redis for session storage |
| **Uptime** | >99.95% (4hrs/year) | - Multi-zone deployment - Database replication - Health checks - Auto-failover |

### Query Performance Guidelines

```python
# ❌ SLOW: N+1 Query Problem
for trip in trips:
    hotel = db.query(Hotel).filter(Hotel.trip_id == trip.id).first()
    # This runs 100 queries for 100 trips!

# ✅ FAST: Use selectinload
from sqlalchemy.orm import selectinload
trips = db.query(Trip).options(selectinload(Trip.hotels)).all()
# This runs 2 queries total

# ✅ FAST: Use Index
class Trip(Base):
    __table_args__ = (
        Index('idx_user_created', 'user_id', 'created_at'),
        Index('idx_destination_date', 'destination', 'departure_date'),
    )

# ✅ FAST: Use Pagination
trips = db.query(Trip).offset(0).limit(20).all()
# Returns 20 rows instead of 100K

# ✅ FAST: Cache Results
redis.set('trips:user:123', json.dumps(trips), ex=3600)
cached = redis.get('trips:user:123')
```

---

## Scaling Strategy

### Phase 1: Vertical Scaling (Current)
- Single instance on Cloud Run
- PostgreSQL 2-core instance
- Redis 1GB cache

**Cost:** ~$50/month  
**Capacity:** ~100 concurrent users, ~1000 requests/min

### Phase 2: Horizontal Scaling (3-6 months)
- Multiple Cloud Run instances (auto-scaling)
- PostgreSQL replica (read scaling)
- Redis cluster (write scaling)

```yaml
# cloud-run deployment
deploy:
  instances:
    min: 2
    max: 10  # Auto-scale up to 10 instances
  cpu: 2
  memory: 2Gi
  concurrency: 100  # 100 requests per instance
```

**Cost:** ~$200-300/month  
**Capacity:** ~1000 concurrent users, ~100K requests/min

### Phase 3: Global Scaling (6-12 months)
- Multi-region deployment (Cloud Run in multiple regions)
- Global load balancing
- PostgreSQL read replicas in each region
- CDN for static content

**Cost:** ~$500-1000/month  
**Capacity:** ~10K concurrent users globally

---

## Database Design

### Current (SQLite)
```
❌ Single file: /path/to/vacay.db
❌ No concurrent writes
❌ No replication
❌ No transactions across tables
```

### Production (PostgreSQL)

```sql
-- Connection pooling
-- max_connections = 100
-- shared_buffers = 256MB
-- effective_cache_size = 1GB

-- Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_email (email),
    INDEX idx_created (created_at)
);

-- Trips Table (with soft delete & audit)
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    departure_date DATE NOT NULL,
    arrival_date DATE NOT NULL,
    adults INT DEFAULT 1,
    children INT DEFAULT 0,
    budget FLOAT NOT NULL,
    trip_data JSONB,  -- Entire itinerary as JSONB
    status VARCHAR(50) DEFAULT 'draft',  -- draft, finalized, archived
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for query performance
    INDEX idx_user_trips (user_id, created_at DESC),
    INDEX idx_destination_date (destination, departure_date),
    INDEX idx_search (destination, departure_date, user_id) WHERE NOT is_deleted,
    INDEX idx_active_trips (user_id, status) WHERE NOT is_deleted,
);

-- Cache Table (if you need persistent cache)
CREATE TABLE cache (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_expires (expires_at)  -- For cleanup job
);

-- Audit Log (for compliance)
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100),
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    changes JSONB,  -- What changed
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_user_action (user_id, created_at DESC),
    INDEX idx_resource (resource_type, resource_id)
);
```

---

## Deployment Pipeline

```
Code Push to GitHub
        ↓
GitHub Actions Trigger
        ├─ Lint & Format Check (pylint, black)
        ├─ Unit Tests (pytest with coverage >80%)
        ├─ Integration Tests (with test DB)
        ├─ Security Scan (bandit, safety)
        ├─ Build Docker Image
        └─ Push to Container Registry
                ↓
        ✅ Tests Pass
                ↓
        Docker Image Ready
                ├─ Tag: latest, v1.0.0, sha-abc123
                ├─ Push to: GCR, Docker Hub
                └─ Store in artifact registry
                        ↓
        Deploy to Staging
                ├─ Deploy to staging Cloud Run
                ├─ Run smoke tests
                ├─ Check logs for errors
                └─ Monitor metrics for 5 minutes
                        ↓
        ✅ Staging Healthy
                ↓
        Wait for Manual Approval (or auto-deploy after 24h)
                ├─ Review changes
                ├─ Check deployment notes
                ├─ Test critical flows manually
                └─ Approve or reject
                        ↓
        Deploy to Production
                ├─ Blue-green deployment
                ├─ 10% traffic to new version
                ├─ Monitor metrics
                ├─ If healthy: 100% traffic
                ├─ If unhealthy: rollback
                └─ Keep old version available for 24h
                        ↓
        Rollback Ready (if needed)
                └─ gcloud run deploy --revision-traffic old=100,new=0
```

---

## Monitoring & Alerting

### Key Metrics to Track

```python
# Application Metrics
- Request count (by endpoint, status, method)
- Request latency (p50, p95, p99)
- Error rate (5xx errors)
- Agent execution time (by agent, by phase)
- Cache hit rate
- Cache miss rate

# Database Metrics
- Query time (p50, p95, p99)
- Connection pool usage
- Active queries
- Slow query count
- Replication lag

# Infrastructure Metrics
- CPU usage
- Memory usage
- Disk I/O
- Network I/O
- Instance count (auto-scaling)

# Business Metrics
- Users created (daily)
- Trips planned (daily)
- Avg trip budget
- Orchestration success rate
- API error types (top 10)
```

### Alert Thresholds

```yaml
alerts:
  - name: high_error_rate
    condition: error_rate > 5%  # More than 5% errors
    severity: critical
    action: page_on_call_engineer

  - name: high_latency
    condition: p99_latency > 1000ms  # P99 over 1 second
    severity: warning
    action: notify_slack_channel

  - name: db_connection_pool_exhausted
    condition: active_connections > 90%
    severity: critical
    action: page_on_call_engineer

  - name: disk_space_low
    condition: disk_usage > 85%
    severity: warning
    action: notify_devops_team

  - name: orchestration_failure
    condition: failure_rate > 10%
    severity: warning
    action: notify_slack_channel
```

---

## Summary: Path to Production

```
Week 1-2: Foundation
├─ Auth (JWT)
├─ Error handling
├─ PostgreSQL migration
└─ Logging

Week 3-4: Features
├─ Caching (Redis)
├─ Complete CRUD
├─ Input validation
└─ Rate limiting

Week 5-6: Operations
├─ Docker & CI/CD
├─ Health checks
├─ Monitoring (Sentry, New Relic)
└─ Documentation

Week 7-8: Quality
├─ Integration tests
├─ Load testing
├─ Security audit
└─ Team training

→ PRODUCTION READY 🚀
```

---

**Remember:** Good architecture is built incrementally. Start with MVP (current), move to production-ready (in 2 months), then optimize for scale (in 6 months).

