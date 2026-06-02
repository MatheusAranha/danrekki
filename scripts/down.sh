#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[down]${NC} $*"; }
warn() { echo -e "${YELLOW}[down]${NC} $*"; }

if ! docker info &>/dev/null; then
  echo "Docker is not accessible. Make sure Docker is running and your user is in the 'docker' group." >&2
  exit 1
fi

CONTAINERS=$(docker ps --filter "label=com.danrekki=true" --format '{{.Names}}')

if [ -z "${CONTAINERS}" ]; then
  warn "No danrekki-managed containers found running."
  exit 0
fi

for CONTAINER in ${CONTAINERS}; do
  info "Stopping container '${CONTAINER}'..."
  docker stop "${CONTAINER}"
done

info "All danrekki containers stopped."
