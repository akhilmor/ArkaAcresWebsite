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

echo "[Migration] Proactively resolving migrations with SQLite syntax issues..."

# Try to resolve each migration proactively (tables already exist from db push)
for MIGRATION_NAME in "${MIGRATIONS[@]}"; do
  echo "[Migration] Attempting to resolve: $MIGRATION_NAME"
  
  # Try to resolve as applied first (tables exist, so this should work)
  RESULT=$(npx prisma migrate resolve --applied "$MIGRATION_NAME" 2>&1)
  if echo "$RESULT" | grep -qi "marked as applied"; then
    echo "[Migration] ✅ Migration $MIGRATION_NAME resolved as applied"
  elif echo "$RESULT" | grep -qi "already applied\|does not exist"; then
    echo "[Migration] ✅ Migration $MIGRATION_NAME already resolved"
  else
    # If that fails, try rolled-back
    ROLLBACK_RESULT=$(npx prisma migrate resolve --rolled-back "$MIGRATION_NAME" 2>&1)
    if echo "$ROLLBACK_RESULT" | grep -qi "marked as rolled-back"; then
      echo "[Migration] ✅ Migration $MIGRATION_NAME resolved as rolled-back"
    else
      echo "[Migration] ⚠️  Could not resolve $MIGRATION_NAME (may need manual resolution)"
    fi
  fi
done

echo "[Migration] Migration resolution check complete"
exit 0

