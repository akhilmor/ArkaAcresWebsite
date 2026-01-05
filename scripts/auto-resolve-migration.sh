#!/bin/bash
# Automated script to resolve failed Prisma migration
# This script will:
# 1. Pull DATABASE_URL from Vercel
# 2. Resolve the failed migration
# 3. Deploy remaining migrations
# 4. Verify everything is correct

set -e

MIGRATION_NAME="20251226134246_add_notification_log"

echo "🔧 Automated Migration Resolution Script"
echo "=========================================="
echo ""

# Step 1: Pull environment variables from Vercel
echo "📥 Step 1: Pulling environment variables from Vercel..."
if npx vercel env pull .env.local 2>/dev/null; then
    echo "✅ Environment variables pulled successfully"
else
    echo "⚠️  Could not pull environment variables automatically"
    echo "   Please ensure you're logged in: npx vercel login"
    exit 1
fi

# Step 2: Check if DATABASE_URL is set
echo ""
echo "🔍 Step 2: Checking DATABASE_URL..."
if [ -f .env.local ] && grep -q "^DATABASE_URL=" .env.local; then
    DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "" ]; then
        echo "❌ DATABASE_URL is empty in .env.local"
        echo ""
        echo "Please set DATABASE_URL in Vercel Dashboard:"
        echo "  1. Go to https://vercel.com/dashboard"
        echo "  2. Select your project → Settings → Environment Variables"
        echo "  3. Add DATABASE_URL with your PostgreSQL connection string"
        echo "  4. Then run this script again"
        exit 1
    fi
    
    # Validate it's a PostgreSQL URL
    if [[ ! "$DATABASE_URL" =~ ^postgres ]]; then
        echo "❌ DATABASE_URL does not appear to be a PostgreSQL connection string"
        echo "   Current value starts with: ${DATABASE_URL:0:20}..."
        echo "   Expected format: postgresql://user:password@host:port/database"
        exit 1
    fi
    
    echo "✅ DATABASE_URL is set and valid"
    export DATABASE_URL
else
    echo "❌ DATABASE_URL not found in .env.local"
    echo ""
    echo "Please set DATABASE_URL in Vercel Dashboard:"
    echo "  1. Go to https://vercel.com/dashboard"
    echo "  2. Select your project → Settings → Environment Variables"
    echo "  3. Add DATABASE_URL with your PostgreSQL connection string"
    echo "  4. Then run: npx vercel env pull .env.local"
    echo "  5. Then run this script again"
    exit 1
fi

# Step 3: Check migration status
echo ""
echo "📋 Step 3: Checking migration status..."
MIGRATION_STATUS=$(npx prisma migrate status 2>&1 || true)
echo "$MIGRATION_STATUS"

# Step 4: Resolve failed migration if needed
echo ""
if echo "$MIGRATION_STATUS" | grep -q "failed\|$MIGRATION_NAME"; then
    echo "🔧 Step 4: Resolving failed migration: $MIGRATION_NAME"
    if npx prisma migrate resolve --applied "$MIGRATION_NAME"; then
        echo "✅ Migration resolved successfully"
    else
        echo "⚠️  Could not resolve migration automatically"
        echo "   Trying alternative: marking as rolled back..."
        npx prisma migrate resolve --rolled-back "$MIGRATION_NAME" || true
    fi
else
    echo "✅ Step 4: No failed migrations detected"
fi

# Step 5: Deploy remaining migrations
echo ""
echo "🚀 Step 5: Deploying remaining migrations..."
if npx prisma migrate deploy; then
    echo "✅ Migrations deployed successfully"
else
    echo "❌ Failed to deploy migrations"
    echo "   Check the error above and resolve manually"
    exit 1
fi

# Step 6: Verify final status
echo ""
echo "✅ Step 6: Verifying final migration status..."
FINAL_STATUS=$(npx prisma migrate status 2>&1)
echo "$FINAL_STATUS"

if echo "$FINAL_STATUS" | grep -q "Database schema is up to date"; then
    echo ""
    echo "🎉 SUCCESS! All migrations are up to date!"
    echo ""
    echo "Next steps:"
    echo "  1. Push any remaining changes: git push"
    echo "  2. Monitor Vercel deployment in dashboard"
    echo "  3. Verify the application works correctly"
else
    echo ""
    echo "⚠️  Migration status check completed, but please verify manually:"
    echo "   npx prisma migrate status"
fi

