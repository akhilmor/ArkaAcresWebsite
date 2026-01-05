#!/bin/bash
# Script to resolve failed Prisma migrations
# Usage: ./scripts/resolve-failed-migration.sh <migration-name>

set -e

MIGRATION_NAME="${1:-20251226134246_add_notification_log}"

echo "🔍 Checking migration status..."
npx prisma migrate status

echo ""
echo "📋 Attempting to resolve failed migration: $MIGRATION_NAME"
echo "   This will mark the migration as applied if the table already exists."
echo ""

# Check if NotificationLog table exists
echo "Checking if NotificationLog table exists..."
npx prisma db execute --stdin <<EOF || true
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'NotificationLog'
) as table_exists;
EOF

echo ""
echo "✅ To mark the failed migration as applied, run:"
echo "   npx prisma migrate resolve --applied $MIGRATION_NAME"
echo ""
echo "   Or if you want to roll it back and retry:"
echo "   npx prisma migrate resolve --rolled-back $MIGRATION_NAME"
echo ""

