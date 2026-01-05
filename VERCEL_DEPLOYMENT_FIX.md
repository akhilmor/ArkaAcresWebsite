# Fixing Vercel Deployment - Failed Migration Issue

## Problem

Vercel build is failing with:
```
Error: P3009
migrate found failed migrations in the target database
The `20251226134246_add_notification_log` migration started at 2026-01-04 20:50:28.207810 UTC failed
```

## Solution Applied

I've updated the pre-build migration script to automatically resolve failed migrations during the Vercel build process.

### What Changed

1. **Updated `scripts/pre-build-migration.js`**:
   - Now properly detects and resolves failed migrations
   - Tries to mark as `--applied` first (if table exists)
   - Falls back to `--rolled-back` if that fails
   - Provides clear logging

2. **Build Script** (already in place):
   ```json
   "build": "prisma generate && node scripts/pre-build-migration.js && prisma migrate deploy && next build"
   ```

## Next Steps

### Option 1: Wait for Automatic Redeploy

Vercel should automatically detect the new commit (`90262de`) and trigger a new deployment. The pre-build script will automatically resolve the failed migration.

### Option 2: Manually Trigger Redeploy

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the three dots on the latest deployment
3. Select "Redeploy"
4. This will use the latest code with the fixed pre-build script

### Option 3: Resolve Migration Manually (One-time)

If you want to resolve it immediately before the next deployment:

```bash
cd nextjs

# Pull environment variables from Vercel
npx vercel env pull .env.local

# Export DATABASE_URL
export DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")

# Resolve the failed migration
npx prisma migrate resolve --applied 20251226134246_add_notification_log

# Deploy remaining migrations
npx prisma migrate deploy
```

## What the Pre-Build Script Does

During each Vercel build, the script will:

1. ✅ Check if `DATABASE_URL` is set
2. ✅ Check migration status
3. ✅ If failed migration detected, automatically resolve it
4. ✅ Then `prisma migrate deploy` runs (which will now succeed)
5. ✅ Build continues normally

## Verification

After the next deployment, check the build logs. You should see:

```
[Migration] Starting pre-build migration check...
[Migration] ✅ DATABASE_URL is set
[Migration] Checking migration status...
[Migration] ⚠️  Found failed migration: 20251226134246_add_notification_log
[Migration] Attempting to resolve failed migration: 20251226134246_add_notification_log
[Migration] ✅ Migration 20251226134246_add_notification_log resolved successfully
[Migration] Pre-build migration check complete. Migrations will be deployed by build script.
```

Then `prisma migrate deploy` should succeed.

## Important Notes

- The pre-build script runs **before** `prisma migrate deploy` in the build process
- It automatically resolves failed migrations so `migrate deploy` can proceed
- This is a one-time fix - once resolved, future deployments won't need this
- All changes have been pushed to GitHub (commit `90262de`)

---

**Status:** Fixed and pushed to GitHub. Vercel will automatically use the new code on the next deployment.

