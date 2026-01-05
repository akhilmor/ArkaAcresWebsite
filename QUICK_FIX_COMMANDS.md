# Quick Fix Commands for Failed Migration

## Immediate Steps to Resolve

### Step 1: Check Current State

```bash
# Check migration status (requires DATABASE_URL)
npx prisma migrate status
```

### Step 2: Resolve Failed Migration

**If the NotificationLog table EXISTS but migration is marked as failed:**

```bash
# Mark the failed migration as applied
npx prisma migrate resolve --applied 20251226134246_add_notification_log
```

**If the NotificationLog table DOES NOT exist:**

```bash
# Mark the failed migration as rolled back (so we can retry)
npx prisma migrate resolve --rolled-back 20251226134246_add_notification_log
```

### Step 3: Deploy Remaining Migrations

```bash
# This will apply the new safe migration
npx prisma migrate deploy
```

### Step 4: Verify Build

```bash
# Test the build locally
npm run build
```

### Step 5: Push to GitHub

```bash
git add .
git commit -m "Fix failed NotificationLog migration with safe migration"
git push
```

## For Vercel Deployment

### Option A: Use Vercel CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Set DATABASE_URL in Vercel (if not already set)
vercel env add DATABASE_URL

# Run migration resolution via Vercel CLI
vercel exec -- npx prisma migrate resolve --applied 20251226134246_add_notification_log

# Deploy
vercel --prod
```

### Option B: Use Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Ensure `DATABASE_URL` is set correctly
4. Go to Deployments → Latest deployment → View Function Logs
5. Check if you can access the database via Vercel's database connection
6. Use Vercel's database console or connect via your local machine with production DATABASE_URL

### Option C: Manual Database Connection

1. Get your production `DATABASE_URL` from Vercel dashboard
2. Set it locally (temporarily):
   ```bash
   export DATABASE_URL="your-production-postgres-url"
   ```
3. Run the resolution commands:
   ```bash
   npx prisma migrate resolve --applied 20251226134246_add_notification_log
   npx prisma migrate deploy
   ```
4. Push changes to trigger a new deployment

## Verification Queries

### Check if table exists:
```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'NotificationLog'
);
```

### Check migration status in database:
```sql
SELECT migration_name, finished_at, applied_steps_count, rolled_back_at
FROM _prisma_migrations
WHERE migration_name LIKE '%notification_log%'
ORDER BY started_at DESC;
```

### Check table structure:
```sql
\d "NotificationLog"
-- or
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'NotificationLog';
```

## Expected Outcome

After running these commands:
- ✅ The failed migration `20251226134246_add_notification_log` is marked as applied
- ✅ The safe migration `20260105141500_fix_notification_log_safe` ensures the table and indexes exist
- ✅ `prisma migrate deploy` completes successfully
- ✅ `npm run build` completes successfully
- ✅ Vercel deployment succeeds

## If Issues Persist

1. **Check Prisma logs:**
   ```bash
   npx prisma migrate status --verbose
   ```

2. **Check database connection:**
   ```bash
   npx prisma db execute --stdin <<< "SELECT version();"
   ```

3. **Reset migration state (LAST RESORT - only if safe):**
   ```bash
   # This will mark all migrations as rolled back
   # Only use if you're sure the database state matches
   npx prisma migrate resolve --rolled-back 20251226134246_add_notification_log
   ```

