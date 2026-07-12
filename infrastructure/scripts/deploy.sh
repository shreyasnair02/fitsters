#!/usr/bin/env bash
set -euo pipefail

# Usage: ./infrastructure/scripts/deploy.sh <user@host>
# Example: ./infrastructure/scripts/deploy.sh pi@raspberrypi.local

HOST="${1:?Usage: deploy.sh <user@host>}"
REPO_DIR="/opt/fitsters"

echo "==> Deploying to $HOST"

ssh "$HOST" bash -s <<REMOTE
set -euo pipefail

cd $REPO_DIR

echo "==> Pulling latest code..."
git pull --ff-only

echo "==> Building and starting containers..."
docker compose -f docker-compose.prod.yml up --build -d

echo "==> Cleaning up old images..."
docker image prune -f

echo "==> Done! Container status:"
docker compose -f docker-compose.prod.yml ps
REMOTE
