# Delivery Agent Management System 🚀

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-v6.19-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-v7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-13%20Passed%20(100%25)-brightgreen?logo=jest&logoColor=white)](https://jestjs.io/)

A full-stack web application for managing delivery agents with strict schema validation, persistent relational storage, intelligent **Redis cache-aside** with deterministic invalidation, and a **minimalist YC-grade UI/UX dashboard**.

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Database Selection & Schema](#-database-selection--schema)
- [Redis Caching Deep Dive](#-redis-caching-deep-dive)
- [API Specification](#-api-specification)
- [Frontend Experience & Design](#-frontend-experience--design)
- [Prerequisites & Environment Variables](#-prerequisites--environment-variables)
- [Setup & Run Instructions](#-setup--run-instructions)
- [Testing & Verification](#-testing--verification)
- [Repository Structure](#-repository-structure)

---

## 🏛 System Architecture

The application adopts a modular layered architecture with separation of concerns:

```mermaid
flowchart TD
    Client["React Frontend (Vite + Tailwind)"]
    API["Express 5 REST API (TypeScript)"]
    Redis[("Redis In-Memory Cache")]
    Postgres[("PostgreSQL Database (Prisma ORM)")]

    Client -->|"HTTP Requests"| API
    API -->|"1. Check Cache (GET)"| Redis
    Redis -.->|"Cache HIT (Return Data)"| API
    Redis -.->|"Cache MISS"| API
    API -->|"2. Query on MISS / Write"| Postgres
    Postgres -->|"Return Fresh Data"| API
    API -->|"3. Set Cache (TTL 300s)"| Redis
    API -->|"4. Invalidate Keys (POST/PUT/DELETE)"| Redis
    API -->|"Response with X-Cache Header"| Client
```

---

## ✨ Key Features

- **Full End-to-End CRUD Operations**:
  - **Create**: Register new delivery couriers with complete field validation.
  - **Read**: Paginated and filtered lists with sub-millisecond Redis response caching.
  - **Details**: View individual courier records with copyable UUIDs and cache telemetry.
  - **Update**: Full or partial attribute updates with automated cache consistency.
  - **Delete**: Record removal with cascade cache purging and safeguard confirmations.
- **Enterprise-Grade Redis Caching**:
  - Deterministic MD5 key generation for query parameter combinations.
  - Cursor-based non-blocking `SCAN` pattern invalidation (prevents Redis thread locks).
  - Telemetry HTTP headers (`X-Cache: HIT` / `X-Cache: MISS`) and execution latency.
  - Fail-soft graceful degradation (transparently bypasses to DB if Redis goes offline).
- **Minimalist YC-Grade Dashboard**:
  - Refined neutral grey canvas aesthetic (`#f4f5f7` Light Grey / `#0e0f12` Dark Charcoal).
  - Integrated theme toggle for instant Light/Dark switching.
  - Real-time fleet KPI summary cards (Total Fleet, Active, Service Areas, Score).
  - Live search with 250ms debounce, status filters, and service zone filters.
  - Dual view modes: Clean Data Table and Grid Cards.
  - Manual "Purge Cache" action button for instant cache verification.
- **Strict Data Validation & Error Handling**:
  - Zod schemas on all endpoints.
  - Normalized HTTP status codes: `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Internal Error`.

---

## 🗄 Database Selection & Schema

### Why PostgreSQL?

1. **Relational Data Integrity**: Delivery agent management mandates strict uniqueness constraints on `email` and `phone` to eliminate duplicate profiles.
2. **Indexing & Query Performance**: High-volume dispatch requires optimized B-Tree indexing on `status` and `serviceArea` columns.
3. **Auditability**: Automated tracking via native `createdAt` and `updatedAt` timestamps.
4. **Prisma 6 Type Safety**: Full end-to-end type sync between database tables, services, and API controllers.

### Schema Definition (`prisma/schema.prisma`)

```prisma
enum AgentStatus {
  ACTIVE
  INACTIVE
  ON_DUTY
  OFF_DUTY
  SUSPENDED
}

enum VehicleType {
  BICYCLE
  MOTORCYCLE
  CAR
  VAN
  WALKER
}

model DeliveryAgent {
  id           String       @id @default(uuid())
  name         String
  phone        String       @unique
  email        String       @unique
  serviceArea  String
  status       AgentStatus  @default(ACTIVE)
  vehicleType  VehicleType? @default(MOTORCYCLE)
  rating       Float        @default(5.0)
  currentLoad  Int          @default(0)
  maxCapacity  Int          @default(10)
  notes        String?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([status])
  @@index([serviceArea])
  @@index([email])
  @@index([phone])
  @@map("delivery_agents")
}
```

---

## ⚡ Redis Caching Deep Dive

### 1. Cached Surfaces

| Endpoint | Cache Key Convention | TTL | Purpose |
| :--- | :--- | :--- | :--- |
| `GET /api/agents` | `agents:list:<md5-checksum>` | 300s (5 min) | Caches paginated and filtered queries. MD5 hash is derived from sorted query parameters. |
| `GET /api/agents/:id` | `agent:<id>` | 300s (5 min) | Caches individual agent profiles for instant lookup. |
| `GET /api/agents/stats/summary`| `agents:stats:summary` | 300s (5 min) | Caches analytical fleet metrics. |

### 2. Cache Invalidation & Consistency Strategy

To maintain **strict cache consistency**, write operations trigger immediate deterministic invalidation:

| Action | Affected Keys | Invalidation Method |
| :--- | :--- | :--- |
| **Create Agent** (`POST /api/agents`) | `agents:list:*`<br>`agents:stats:summary` | Scans and deletes all list keys and purges summary stats. |
| **Update Agent** (`PUT /api/agents/:id`) | `agent:<id>`<br>`agents:list:*`<br>`agents:stats:summary` | Deletes specific agent key, and purges all list keys and summary stats. |
| **Delete Agent** (`DELETE /api/agents/:id`)| `agent:<id>`<br>`agents:list:*`<br>`agents:stats:summary` | Deletes specific agent key, and purges all list keys and summary stats. |

### 3. Non-Blocking Key Deletion (`SCAN` vs `KEYS`)

Standard Redis `KEYS` commands block the single-threaded Redis process on large key sets. This implementation uses **cursor-based `SCAN`** with batch counts of 100:

```typescript
let cursor = '0';
do {
  const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
  cursor = nextCursor;
  if (keys.length > 0) {
    await client.del(...keys);
  }
} while (cursor !== '0');
```

### 4. Telemetry Header

Every read response returns an `X-Cache` HTTP header:
- `X-Cache: HIT`: Delivered directly from Redis memory in under 2ms.
- `X-Cache: MISS`: Query routed to PostgreSQL, written into Redis, and delivered.

---

## 📡 API Specification

### Endpoints Overview

| Method | Route | Description | Cache Behavior |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Infrastructure health check & latency | Bypass |
| `GET` | `/api/agents` | List agents with filters & pagination | Cached (`X-Cache`) |
| `GET` | `/api/agents/:id` | Get single agent by ID | Cached (`X-Cache`) |
| `POST` | `/api/agents` | Create a new delivery agent | Invalidates list cache |
| `PUT` | `/api/agents/:id` | Update delivery agent information | Invalidates agent & lists |
| `DELETE` | `/api/agents/:id` | Remove delivery agent record | Invalidates agent & lists |
| `GET` | `/api/agents/stats/summary` | Aggregate fleet analytics | Cached (`X-Cache`) |
| `POST` | `/api/agents/cache/purge` | Flush all agent-related Redis keys | Manual purge |

---

### Request & Response Examples

#### 1. Create Agent (`POST /api/agents`)

```bash
curl -X POST http://localhost:5001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jordan Smith",
    "phone": "+1-202-555-0143",
    "email": "jordan.smith@speedyfleet.com",
    "serviceArea": "Downtown Central",
    "status": "ACTIVE",
    "vehicleType": "MOTORCYCLE",
    "rating": 4.9,
    "maxCapacity": 12,
    "notes": "Express parcel specialist"
  }'
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Delivery agent created successfully.",
  "data": {
    "id": "e6a21850-84cf-47d3-a619-354363dd101c",
    "name": "Jordan Smith",
    "phone": "+1-202-555-0143",
    "email": "jordan.smith@speedyfleet.com",
    "serviceArea": "Downtown Central",
    "status": "ACTIVE",
    "vehicleType": "MOTORCYCLE",
    "rating": 4.9,
    "currentLoad": 0,
    "maxCapacity": 12,
    "notes": "Express parcel specialist",
    "createdAt": "2026-10-06T08:14:37.526Z",
    "updatedAt": "2026-10-06T08:14:37.526Z"
  }
}
```

#### 2. Get Agents List (`GET /api/agents`)

**Query Parameters:**
- `page`: Page number (default: `1`)
- `limit`: Items per page (default: `10`, max: `100`)
- `search`: Substring search on `name`, `email`, `phone`, or `serviceArea`
- `status`: Filter by `ACTIVE`, `INACTIVE`, `ON_DUTY`, `OFF_DUTY`, `SUSPENDED`
- `serviceArea`: Case-insensitive zone filter
- `vehicleType`: Filter by `BICYCLE`, `MOTORCYCLE`, `CAR`, `VAN`, `WALKER`
- `sortBy`: `createdAt`, `name`, `rating`, `status` (default: `createdAt`)
- `sortOrder`: `asc` or `desc` (default: `desc`)

```bash
curl -i "http://localhost:5001/api/agents?page=1&limit=5&status=ACTIVE"
```

**Response Headers:**
```http
HTTP/1.1 200 OK
X-Cache: HIT
Content-Type: application/json; charset=utf-8
```

---

## 🎨 Frontend Experience & Design

The frontend delivers a **clean, minimal YC-level aesthetic** built with Tailwind CSS:

- **Color Palette**: Neutral grey canvas (`#f4f5f7` / `#0e0f12`), crisp white/slate panels (`#ffffff` / `#16171d`), and hairline borders (`border-zinc-200` / `border-zinc-800`).
- **Typography**: Clean hierarchy with `Plus Jakarta Sans`, tight letter-spacing, and muted micro-labels.
- **Real-time Observability**: Live status indicator displaying `Cache: HIT` (green) or `Cache: MISS` (amber) with millisecond latency.
- **Telemetry Card**: Individual detail modal includes a **Redis Cache Provenance** badge.
- **Safety First**: Deletions require explicit confirmation via a safeguard modal.

---

## ⚙️ Prerequisites & Environment Variables

- **Node.js**: v18 or higher (v20+ recommended)
- **PostgreSQL**: v14+ or Docker
- **Redis**: v6+ or Docker

### Environment Configuration (`backend/.env.example`)

```env
# Application Environment
NODE_ENV=development
PORT=5001

# PostgreSQL Database Connection
# Format: postgresql://<user>:<password>@<host>:<port>/<database>
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/delivery_agent_db"

# Redis Cache Connection
# Format: redis://[:password@]host[:port][/db-number]
REDIS_URL="redis://localhost:6379"
REDIS_CACHE_TTL_SECONDS=300
REDIS_CACHE_ENABLED=true

# Allowed CORS Origins
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

---

## 🚀 Setup & Run Instructions

### Option 1: Docker Compose for Database & Redis (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/CodeNova-Ayush/ZohoAssignment.git
   cd ZohoAssignment
   ```

2. **Start PostgreSQL & Redis in Docker**:
   ```bash
   docker compose up -d
   ```

3. **Install dependencies**:
   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

4. **Configure environment**:
   ```bash
   cp backend/.env.example backend/.env
   ```

5. **Deploy database migrations and seed fleet records**:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

6. **Start both backend and frontend concurrently**:
   ```bash
   npm run dev
   ```

   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5001](http://localhost:5001)
   - **System Health**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

### Option 2: Native Local PostgreSQL & Redis

1. Ensure PostgreSQL is active on port 5432 and Redis on port 6379:
   ```bash
   createdb delivery_agent_db
   ```
2. Update `DATABASE_URL` in `backend/.env` with your credentials.
3. Run:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   npm run dev
   ```

---

## 🧪 Testing & Verification

### 1. Automated Integration Test Suite

Run the full Jest integration test suite:

```bash
npm test
```

**Test Coverage Summary (13/13 passing):**
```
PASS tests/agent.test.ts
  Delivery Agent Management API - Integration Tests
    GET /api/health
      ✓ should return healthy status for database and redis (31 ms)
    POST /api/agents (Create)
      ✓ should validate and reject missing required fields with 400 (7 ms)
      ✓ should create a valid delivery agent with 201 Created (10 ms)
      ✓ should reject duplicate email with 409 Conflict (3 ms)
      ✓ should reject duplicate phone with 409 Conflict (2 ms)
    GET /api/agents (List & Redis Caching)
      ✓ should fetch agents list with pagination metadata (13 ms)
      ✓ should serve second identical request from Redis cache with X-Cache: HIT (4 ms)
      ✓ should filter agents by status (4 ms)
    GET /api/agents/:id (Detail & Caching)
      ✓ should return 404 for non-existent agent id (2 ms)
      ✓ should return agent details and cache individual record (2 ms)
    PUT /api/agents/:id (Update & Cache Invalidation)
      ✓ should update agent information and invalidate Redis cache (6 ms)
    DELETE /api/agents/:id (Delete & Invalidation)
      ✓ should delete agent and return 404 on subsequent detail request (4 ms)
    GET /api/agents/stats/summary
      ✓ should return aggregated metrics across delivery fleet (2 ms)

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

### 2. Manual cURL Verification Flow

Verify cache HIT/MISS and invalidation behavior directly:

```bash
# 1. Cold Request -> Hits PostgreSQL, populates cache
curl -i -s "http://localhost:5001/api/agents?page=1&limit=3" | grep "X-Cache"
# Output: X-Cache: MISS

# 2. Warm Request -> Served directly from Redis (< 2ms)
curl -i -s "http://localhost:5001/api/agents?page=1&limit=3" | grep "X-Cache"
# Output: X-Cache: HIT

# 3. Purge Cache on demand
curl -X POST http://localhost:5001/api/agents/cache/purge

# 4. Next Request -> Cold again (PostgreSQL)
curl -i -s "http://localhost:5001/api/agents?page=1&limit=3" | grep "X-Cache"
# Output: X-Cache: MISS
```

---

## 📂 Repository Structure

```
.
├── backend/
│   ├── prisma/
│   │   ├── migrations/          # SQL migrations
│   │   ├── schema.prisma        # Database schema & enums
│   │   └── seed.ts              # Fleet seed dataset
│   ├── src/
│   │   ├── config/              # Env, Prisma DB, and Redis clients
│   │   ├── controllers/         # Express HTTP route controllers
│   │   ├── middlewares/         # Zod validation & global error handler
│   │   ├── routes/              # Express API route endpoints
│   │   ├── services/            # Business logic & Redis cache service
│   │   ├── types/               # TypeScript interfaces & DTOs
│   │   ├── utils/               # Custom application error classes
│   │   ├── validations/         # Zod validation schemas
│   │   ├── app.ts               # Express application initialization
│   │   └── server.ts            # Entrypoint with graceful shutdown
│   ├── tests/
│   │   └── agent.test.ts        # Integration test suite
│   ├── jest.config.js
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Tables, modals, filters, badges, cards
│   │   ├── services/            # API client with telemetry parsing
│   │   ├── types.ts             # Frontend type models
│   │   ├── App.tsx              # Main dashboard component
│   │   ├── index.css            # Tailwind & CSS custom variables
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
├── docker-compose.yml           # PostgreSQL & Redis infrastructure
├── .gitignore
├── package.json                 # Monorepo orchestration scripts
└── README.md
```

---

## 📄 License

ISC License. Built for Delivery Agent Fleet Operations.
