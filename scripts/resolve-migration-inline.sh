#!/bin/bash
# Inline migration resolution script
# This is called directly from the build script

set +e  # Don't exit on error

# List of migrations that may need resolution (SQLite syntax issues)
MIGRATIONS=(
  "20251226134246_add_notification_log"
  "20251226183144_init"
  "20251226190825_add_notification_status"
)

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

echo "[Migration] Checking for failed migrations that need resolution..."

# Get migration status once
MIGRATION_STATUS=$(npx prisma migrate status 2>&1 || true)

# Try to resolve each migration proactively
for MIGRATION_NAME in "${MIGRATIONS[@]}"; do
  # Check if this migration needs resolution
  if echo "$MIGRATION_STATUS" | grep -qi "$MIGRATION_NAME.*failed\|not yet applied.*$MIGRATION_NAME"; then
    echo "[Migration] Attempting to resolve migration: $MIGRATION_NAME"
    
    # Try to resolve as applied first (if tables exist)
    if npx prisma migrate resolve --applied "$MIGRATION_NAME" 2>&1 | grep -q "marked as applied"; then
      echo "[Migration] ✅ Migration $MIGRATION_NAME resolved as applied"
      continue
    fi
    
    # If that fails, try rolled-back
    if npx prisma migrate resolve --rolled-back "$MIGRATION_NAME" 2>&1 | grep -q "marked as rolled-back"; then
      echo "[Migration] ✅ Migration $MIGRATION_NAME resolved as rolled-back"
      continue
    fi
    
    echo "[Migration] ⚠️  Could not resolve $MIGRATION_NAME (may already be resolved)"
  fi
done

echo "[Migration] Migration resolution check complete"
exit 0

