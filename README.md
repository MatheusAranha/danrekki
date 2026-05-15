# Danrekki — Naruto RPG Training Management System

A full-stack web application for managing a tabletop RPG set in the Naruto universe. Players track their characters' training progress, spend Training Days (DT) to learn jutsus and skills, and access training sources through libraries and senseis. Administrators manage all game data from a dedicated back-office.

---

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Domain Model](#domain-model)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [Key Concepts](#key-concepts)
- [Tech Stack](#tech-stack)

---

## Architecture

Danrekki is an **NX monorepo** following **Hexagonal Architecture (Ports & Adapters)** with Domain-Driven Design principles.

```
┌─────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                          │
│        Controllers · Repositories · Express · MongoDB       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   APPLICATION                          │  │
│  │                    Use Cases                           │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │                   DOMAIN                         │  │  │
│  │  │   Entities · Value Objects · Domain Services    │  │  │
│  │  │              (Pure code — No I/O)               │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

Dependencies always point inward. The domain layer has zero knowledge of Express, MongoDB, or any framework.

### Packages

| Package | Path | Role |
|---------|------|------|
| `@danrekki/shared` | `libs/shared` | All domain logic, use cases, repository ports, and adapters |
| `@danrekki/api` | `apps/api` | Express HTTP server, manual DI composition root |
| `@danrekki/web` | `apps/web` | React SPA — admin back-office + player portal |

---

## Project Structure

```
danrekki/
├── apps/
│   ├── api/                         # Express API server
│   │   └── src/
│   │       ├── app.ts               # Manual DI — wires all use cases
│   │       ├── server.ts            # Bootstrap entry point
│   │       ├── config.ts            # Env-driven configuration
│   │       └── database/
│   │           └── mongodb.ts       # MongoDB connection
│   └── web/                         # React SPA
│       └── src/
│           ├── api/                 # Axios API modules per domain
│           ├── components/          # Shared UI components
│           ├── pages/
│           │   ├── admin/           # Admin back-office pages
│           │   └── player/          # Player portal pages
│           ├── router/              # React Router v6 config
│           └── stores/              # Zustand state stores
└── libs/
    └── shared/
        └── src/
            ├── _shared/             # Cross-cutting: logger, validator, types
            └── domains/             # One folder per domain
                └── {domain}-v1/
                    ├── core/        # Domain + application layer (no I/O)
                    │   ├── entity.ts
                    │   ├── entity.schema.ts
                    │   ├── types.ts
                    │   ├── errors.ts
                    │   ├── factory.ts
                    │   ├── database-repository.ts
                    │   ├── services/
                    │   └── use-cases/
                    └── adapters/    # Infrastructure implementations
                        ├── mongo-*-database-repository.ts
                        └── express-*.controller.ts
```

---

## Domain Model

### Reference Data (admin-managed)

| Domain | Description |
|--------|-------------|
| `clan-v1` | Ninja clans with DT cost modifiers per release |
| `release-v1` | Game content releases (e.g., expansions) |
| `jutsu-rank-v1` | Jutsu difficulty tiers (e.g., D-rank, S-rank) |
| `ninja-rank-v1` | Character rank tiers (Genin, Chunin, Jonin, …) |
| `jutsu-v1` | Jutsu definitions with elemental affinities |
| `trainable-content-v1` | Learnable content: jutsus, tools, weapons, feats, skill proficiencies |
| `library-v1` | Physical libraries containing jutsu scrolls |
| `library-scroll-v1` | Scrolls inside a library, each tied to one jutsu |
| `sensei-v1` | Senseis who can teach trainable content |
| `sensei-content-v1` | Content a sensei teaches, with required proximity |

### Character Data (per-player)

| Domain | Description |
|--------|-------------|
| `user-v1` | User accounts with role (`admin` / `player`) |
| `character-v1` | Player characters with DT balance and elemental affinities |
| `character-release-v1` | Releases unlocked for a character (affects DT cost discounts) |
| `character-library-v1` | Libraries a character has access to |
| `character-sensei-v1` | Senseis assigned to a character (with proximity score) |
| `dt-transaction-v1` | Immutable ledger of DT credit/debit events |
| `character-learning-progress-v1` | Learning progress per character per trainable content |

### Key Business Rules

- **DT Cost**: Base cost defined on each trainable content. Clan modifiers (multipliers per release) apply when a character has unlocked matching releases. The best (lowest) applicable multiplier wins.
- **Elemental Affinities**: Characters have elemental affinities (`katon`, `suiton`, `doton`, `futon`, `raiton`, `iryo`). Jutsus require matching elements to be eligible. Jutsus with no elements are always learnable by anyone.
- **Access Control**: To start learning a jutsu, the character must have library access to a scroll for that jutsu OR a sensei who teaches it with adequate proximity. Non-jutsu content requires a sensei.
- **Atomic DT Investment**: Investing DT runs atomically — it debits the character's DT balance, creates a DT transaction ledger entry, and updates learning progress in a single MongoDB transaction.

---

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8

```bash
npm install -g pnpm
```

- **MongoDB** >= 6.0 with a **ReplicaSet** enabled (required for atomic DT investment transactions)

### Quick MongoDB ReplicaSet setup with Docker

```bash
# Start a single-node replica set
docker run -d \
  --name mongo-rs \
  -p 27017:27017 \
  mongo:6 \
  --replSet rs0

# Initialise the replica set (run once after the container starts)
docker exec -it mongo-rs mongosh --eval "rs.initiate()"
```

Alternatively, use **MongoDB Atlas** (free tier works) — copy the connection string into `MONGO_URL`.

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd danrekki

# 2. Install all dependencies across all packages
pnpm install

# 3. Set up environment variables
#    Create apps/api/.env (see Environment Variables section below)
```

---

## Environment Variables

Create `apps/api/.env`:

```env
# MongoDB connection string — must point to a ReplicaSet for transactions to work
MONGO_URL=mongodb://localhost:27017/danrekki?replicaSet=rs0

# JWT secret — use a long, random string in production
JWT_SECRET=change-this-to-a-long-random-string

# JWT token expiry
JWT_EXPIRES_IN=7d

# Port the API listens on
PORT=3000
```

> All variables have defaults for local development. **Never use the default `JWT_SECRET` in production.**

---

## Running the Application

### Development (with hot-reload)

Open two terminals:

**Terminal 1 — API server** (http://localhost:3000)

```bash
pnpm dev:api
```

**Terminal 2 — Web app** (http://localhost:4200)

```bash
pnpm dev:web
```

The web app proxies all `/api/*` requests to the API server, so open only **http://localhost:4200** in your browser.

### Run tests

```bash
# All packages
pnpm test

# Specific package
pnpm --filter @danrekki/shared test
pnpm --filter @danrekki/api test
```

### Type-checking

```bash
# All packages
pnpm --filter @danrekki/shared exec tsc --noEmit
pnpm --filter @danrekki/api exec tsc --noEmit
pnpm --filter @danrekki/web exec tsc --noEmit
```

### Linting

```bash
pnpm lint
```

---

## Building for Production

```bash
# Build all packages
pnpm build

# Build individually
pnpm --filter @danrekki/api build    # output: dist/apps/api/
pnpm --filter @danrekki/web build    # output: dist/apps/web/
```

### Run the API in production

```bash
node dist/apps/api/server.js
```

### Serve the web app in production

The web build produces static files in `dist/apps/web/`. Serve them with any HTTP server, making sure all paths fall back to `index.html` for SPA routing:

```bash
# Example using the serve package
npx serve dist/apps/web -s
```

---

## API Reference

Base URL: `http://localhost:3000` (development)

Authenticated endpoints require the header:
```
Authorization: Bearer <token>
```

---

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/login` | Authenticate and receive a JWT |

**Request body:**
```json
{ "email": "user@example.com", "password": "yourpassword" }
```

**Response:**
```json
{ "token": "<jwt>", "user": { "_id": "...", "email": "...", "role": "admin" } }
```

---

### Users

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get a user by ID |
| `POST` | `/users` | Create a user |
| `PATCH` | `/users/:id` | Update a user |
| `DELETE` | `/users/:id` | Delete a user |

---

### Characters

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/characters` | List all characters |
| `GET` | `/characters/:id` | Get a character by ID |
| `POST` | `/characters` | Create a character |
| `PATCH` | `/characters/:id` | Update name, clan, or elemental affinities |
| `DELETE` | `/characters/:id` | Delete a character |

---

### Character — Releases

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/characters/:characterId/releases` | List releases unlocked for a character |
| `POST` | `/characters/:characterId/releases` | Unlock a release for a character |
| `DELETE` | `/characters/:characterId/releases/:releaseAssignmentId` | Revoke a release |

---

### Character — Libraries

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/characters/:characterId/libraries` | List library access records |
| `GET` | `/characters/:characterId/libraries/:assignmentId` | Get one library assignment |
| `POST` | `/characters/:characterId/libraries` | Grant access to a library |
| `DELETE` | `/characters/:characterId/libraries/:assignmentId` | Revoke library access |

---

### Character — Senseis

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/characters/:characterId/senseis` | List assigned senseis |
| `GET` | `/characters/:characterId/senseis/:assignmentId` | Get one sensei assignment |
| `POST` | `/characters/:characterId/senseis` | Assign a sensei (include proximity score) |
| `DELETE` | `/characters/:characterId/senseis/:assignmentId` | Remove a sensei |

---

### Character — DT Transactions

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/characters/:characterId/dt-transactions` | List DT transaction history |
| `POST` | `/characters/:characterId/dt-transactions` | Add a DT credit or debit |

**Add DT body:**
```json
{ "amount": 100, "reason": "Weekly training reward" }
```

> Use a **positive** `amount` for credits and a **negative** `amount` for debits. Transactions are immutable once created.

---

### Training Catalog

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/characters/:characterId/training-catalog` | Get the character's available training catalog |

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `include_ineligible` | `boolean` | `false` | When `true`, includes jutsus the character lacks the elemental affinity for |

**Response shape:**
```json
{
  "library_entries": [
    {
      "trainable_content": { "_id": "...", "name": "Fireball Jutsu", "type": "jutsu", "base_dt_cost": 100, "..." },
      "jutsu": { "_id": "...", "name": "Fireball Jutsu", "elements": ["katon"], "..." },
      "dt_cost": 80,
      "source": { "type": "library", "library_id": "..." },
      "learning_progress": null
    }
  ],
  "sensei_entries": [
    {
      "trainable_content": { "..." },
      "jutsu": null,
      "dt_cost": 32,
      "source": { "type": "sensei", "sensei_id": "..." },
      "learning_progress": { "status": "in_progress", "dt_invested": 10, "dt_required": 32, "..." }
    }
  ]
}
```

> The same jutsu appears in **both sections** if it is available through both a library and a sensei.

---

### Learning Progress

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/characters/:characterId/learning-progress` | List all learning progress records |
| `GET` | `/characters/:characterId/learning-progress/:progressId` | Get one progress record |
| `POST` | `/characters/:characterId/learning-progress` | Start learning a trainable content |
| `POST` | `/characters/:characterId/learning-progress/:progressId/invest` | Invest DT into a learning record |

**Start learning body:**
```json
{ "trainable_content_id": "<id>" }
```

> Returns `403 Forbidden` if the character does not have access to the content (no qualifying library scroll or sensei).

**Invest DT body:**
```json
{ "amount": 20 }
```

> The investment runs atomically. Returns `422` if the character does not have enough DT. Returns `409` if the content is already completed.

---

### Reference Data

All reference resources follow the same CRUD pattern:

| Resource | Base path |
|----------|-----------|
| Clans | `/clans` |
| Releases | `/releases` |
| Jutsu Ranks | `/jutsu-ranks` |
| Ninja Ranks | `/ninja-ranks` |
| Jutsus | `/jutsus` |
| Trainable Contents | `/trainable-contents` |
| Libraries | `/libraries` |
| Library Scrolls | `/libraries/:libraryId/scrolls` |
| Senseis | `/senseis` |
| Sensei Contents | `/senseis/:senseiId/contents` |

Each supports:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/<resource>` | List all |
| `GET` | `/<resource>/:id` | Get by ID |
| `POST` | `/<resource>` | Create |
| `PATCH` | `/<resource>/:id` | Update |
| `DELETE` | `/<resource>/:id` | Delete |

---

## User Roles

| Role | Portal | Access |
|------|--------|--------|
| `admin` | `/admin/*` | Full access — manages all game data, characters, users, and DT ledger |
| `player` | `/player/*` | Read-only game data — views their character, browses catalog, starts learning, invests DT |

After login, the app redirects automatically based on role.

### Creating the first admin

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@danrekki.com", "password": "yourpassword", "role": "admin" }'
```

Then log in at http://localhost:4200/login.

---

## Key Concepts

### Training Days (DT)

DT is the in-game currency for learning. Each trainable content has a `base_dt_cost`. The actual cost for a character is:

```
actual_cost = ceil(base_dt_cost × best_applicable_clan_modifier)
```

Clan modifiers are release-scoped multipliers (e.g., `0.75` for a 25% discount). A modifier applies only when the character has that release unlocked. Multiple applicable modifiers exist — the lowest (best) one wins. If none apply, the base cost is used.

### Elemental Affinities

Six elements exist: `katon` (fire), `suiton` (water), `doton` (earth), `futon` (wind), `raiton` (lightning), `iryo` (medical). A jutsu can require one or more elements. A character can only learn it if they share at least one element with the jutsu. Jutsus with an **empty elements list** are always learnable by any character.

### Training Access

To start learning content, the system checks:

- **Jutsu-type content** — the character needs **at least one** of:
  - A library access record for a library that holds a scroll for that jutsu
  - A sensei who teaches that content AND the character's proximity to that sensei is ≥ the sensei content's `required_proximity`
- **Non-jutsu content** (tools, weapons, feats, skill proficiencies) — requires a qualifying sensei with adequate proximity

### Atomic DT Investment

When a player invests DT, three writes happen together inside a **MongoDB transaction**:

1. `character.available_dt` is decremented by the invested amount
2. A new `dt-transaction` ledger record is inserted (positive `amount` = credit; negative = debit)
3. `learning_progress.dt_invested` is incremented; if `dt_invested >= dt_required`, status becomes `completed`

If any step fails, the entire operation rolls back. This requires MongoDB to be running as a ReplicaSet.

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| TypeScript | ^5.4 | Language |
| Express | ^4.18 | HTTP framework |
| MongoDB driver | ^6.3 | Database (ReplicaSet for transactions) |
| AJV | ^8.12 | JSON Schema Draft-07 validation |
| jsonwebtoken | ^9.0 | JWT authentication |
| bcryptjs | ^2.4 | Password hashing |
| NX | ^20.3 | Monorepo build orchestration |
| pnpm | ≥ 8 | Package management + workspaces |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^18.2 | UI framework |
| Vite | ^5.0 | Build tool + dev server with `/api` proxy |
| Tailwind CSS | ^3.4 | Utility-first dark-theme styling |
| React Router | ^6.21 | Client-side routing (admin + player portals) |
| Zustand | ^4.5 | Lightweight global state (auth, toasts) |
| Axios | ^1.6 | HTTP client with auto-logout on 401 |

### Testing & Tooling

| Technology | Purpose |
|------------|---------|
| Jest | Unit and integration test runner |
| Supertest | HTTP integration testing for Express routes |
| `@faker-js/faker` | Realistic fake data in domain factories |
| `json-schema-faker` | Schema-driven random data generation |
