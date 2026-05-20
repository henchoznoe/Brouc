#!/bin/bash
# File: deploy.sh
# Description: Pull latest code, rebuild and redeploy the Brouc app on VPS.
# Usage: ssh into VPS, cd /opt/brouc, then run ./deploy.sh

set -e

APP_DIR="/opt/brouc"
COMPOSE_FILE="docker-compose.prod.yml"

cd "$APP_DIR"

echo "==> Pulling latest changes..."
git pull origin main

echo "==> Rebuilding Docker image..."
docker compose -f "$COMPOSE_FILE" build --no-cache app

echo "==> Running database migrations..."
docker compose -f "$COMPOSE_FILE" run --rm app npx prisma migrate deploy

echo "==> Restarting app..."
docker compose -f "$COMPOSE_FILE" up -d app

echo "==> Cleaning up old images..."
docker image prune -f

echo "==> Done. App redeployed."
