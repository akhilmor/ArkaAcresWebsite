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

# Try to resolve each migration
for MIGRATION_NAME in "${MIGRATIONS[@]}"; do
  echo "[Migration] Checking migration: $MIGRATION_NAME"
  
  # Check if this migration is in a failed state
  STATUS=$(npx prisma migrate status 2>&1 | grep -i "$MIGRATION_NAME" || true)
  
  if echo "$STATUS" | grep -qi "failed\|not yet applied"; then
    echo "[Migration] Attempting to resolve failed migration: $MIGRATION_NAME"
    
    # Try to resolve as applied first (if tables exist)
    if npx prisma migrate resolve --applied "$MIGRATION_NAME" 2>&1; then
      echo "[Migration] ✅ Migration $MIGRATION_NAME resolved as applied"
      continue
    fi
    
    # If that fails, try rolled-back
    if npx prisma migrate resolve --rolled-back "$MIGRATION_NAME" 2>&1; then
      echo "[Migration] ✅ Migration $MIGRATION_NAME resolved as rolled-back"
      continue
    fi
    
    echo "[Migration] ⚠️  Could not resolve $MIGRATION_NAME automatically"
  else
    echo "[Migration] ✅ Migration $MIGRATION_NAME is already resolved or doesn't exist"
  fi
done

echo "[Migration] Migration resolution check complete"
exit 0

