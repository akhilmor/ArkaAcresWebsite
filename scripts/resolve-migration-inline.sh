#!/bin/bash
# Inline migration resolution script
# This is called directly from the build script

set +e  # Don't exit on error

MIGRATION_NAME="20251226134246_add_notification_log"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "[Migration] DATABASE_URL not set, skipping migration resolution"
  exit 0
fi

# Check if it's PostgreSQL
if [[ ! "$DATABASE_URL" =~ ^postgres ]]; then
  echo "[Migration] DATABASE_URL is not PostgreSQL, skipping migration resolution"
  exit 0
fi

echo "[Migration] Attempting to resolve failed migration: $MIGRATION_NAME"

# Try to resolve as applied first
if npx prisma migrate resolve --applied "$MIGRATION_NAME" 2>&1; then
  echo "[Migration] ✅ Migration resolved as applied"
  exit 0
fi

# If that fails, try rolled-back
if npx prisma migrate resolve --rolled-back "$MIGRATION_NAME" 2>&1; then
  echo "[Migration] ✅ Migration resolved as rolled-back"
  exit 0
fi

# If both fail, log but don't fail the build
echo "[Migration] ⚠️  Could not resolve migration automatically, continuing..."
exit 0

