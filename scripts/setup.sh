#!/usr/bin/env bash
set -euo pipefail

MONGO_CONTAINER="danrekki-mongo"
MONGO_PORT=27017

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${GREEN}[setup]${NC} $*"; }
warn()    { echo -e "${YELLOW}[setup]${NC} $*"; }
error()   { echo -e "${RED}[setup]${NC} $*" >&2; exit 1; }

# ── 1. Check prerequisites ────────────────────────────────────────────────────

if ! command -v docker &>/dev/null; then
  error "Docker is not installed. Install it from https://docs.docker.com/get-docker/"
fi

if ! docker info &>/dev/null; then
  error "Docker daemon is not running. Start Docker and try again."
fi

if ! command -v node &>/dev/null; then
  error "Node.js is not installed. Install Node.js >= 18 from https://nodejs.org"
fi

NODE_VERSION=$(node -e "process.exit(parseInt(process.versions.node) < 18 ? 1 : 0)" 2>&1 || true)
if ! node -e "process.exit(parseInt(process.versions.node) < 18 ? 1 : 0)" 2>/dev/null; then
  error "Node.js >= 18 is required. Current: $(node --version)"
fi

if ! command -v pnpm &>/dev/null; then
  warn "pnpm not found — installing..."
  npm install -g pnpm
fi

info "Prerequisites OK"

# ── 2. Install dependencies ───────────────────────────────────────────────────

info "Installing dependencies..."
pnpm install

# ── 3. MongoDB ReplicaSet container ──────────────────────────────────────────

if docker ps --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER}$"; then
  info "MongoDB container '${MONGO_CONTAINER}' is already running."
else
  if docker ps -a --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER}$"; then
    info "Starting existing MongoDB container '${MONGO_CONTAINER}'..."
    docker start "${MONGO_CONTAINER}"
  else
    info "Creating MongoDB ReplicaSet container '${MONGO_CONTAINER}'..."
    docker run -d \
      --name "${MONGO_CONTAINER}" \
      -p "${MONGO_PORT}:27017" \
      --restart unless-stopped \
      mongo:6 \
      --replSet rs0
  fi
fi

# ── 4. Initialise the replica set (idempotent) ───────────────────────────────

info "Waiting for MongoDB to be ready..."
MAX_WAIT=30
WAITED=0
until docker exec "${MONGO_CONTAINER}" mongosh --quiet --eval "db.adminCommand('ping').ok" &>/dev/null; do
  if [ "${WAITED}" -ge "${MAX_WAIT}" ]; then
    error "MongoDB did not become ready within ${MAX_WAIT}s."
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done

RS_STATUS=$(docker exec "${MONGO_CONTAINER}" mongosh --quiet --eval \
  "try { rs.status().ok } catch(e) { 0 }" 2>/dev/null || echo "0")

if [ "${RS_STATUS}" != "1" ]; then
  info "Initialising ReplicaSet..."
  docker exec "${MONGO_CONTAINER}" mongosh --quiet --eval "rs.initiate()" &>/dev/null
  sleep 3
  info "ReplicaSet initialised."
else
  info "ReplicaSet already initialised."
fi

# ── 5. Environment file ───────────────────────────────────────────────────────

ENV_FILE="apps/api/.env"
ENV_EXAMPLE="apps/api/.env.example"

if [ -f "${ENV_FILE}" ]; then
  info ".env file already exists — skipping."
else
  if [ -f "${ENV_EXAMPLE}" ]; then
    cp "${ENV_EXAMPLE}" "${ENV_FILE}"
    info "Created ${ENV_FILE} from ${ENV_EXAMPLE}."
    warn "Review apps/api/.env and update JWT_SECRET before deploying to production."
  else
    warn "${ENV_EXAMPLE} not found — skipping .env creation."
  fi
fi

# ── Done ──────────────────────────────────────────────────────────────────────

echo ""
info "Setup complete! Start the application with:"
echo ""
echo "  Terminal 1 (API):  pnpm dev:api"
echo "  Terminal 2 (Web):  pnpm dev:web"
echo ""
echo "  Then open: http://localhost:4200"
echo ""
