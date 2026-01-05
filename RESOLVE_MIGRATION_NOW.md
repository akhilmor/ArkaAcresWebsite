# ⚠️ CRITICAL: DATABASE_URL Not Set in Vercel

## Problem Identified

The `DATABASE_URL` environment variable is **not set** in your Vercel project. This is why the migration is failing.

## Immediate Action Required

### Step 1: Set DATABASE_URL in Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project: `nextjs` (or your project name)

2. **Navigate to Environment Variables:**
   - Click **Settings** → **Environment Variables**

3. **Add DATABASE_URL:**
   - Click **Add New**
   - **Name:** `DATABASE_URL`
   - **Value:** Your PostgreSQL connection string
     - Format: `postgresql://user:password@host:port/database?sslmode=require`
   - **Environment:** Select **Production** (and Preview/Development if desired)
   - Click **Save**

### Step 2: Get Your PostgreSQL Connection String

**If using Vercel Postgres:**
- Go to Vercel Dashboard → Your Project → Storage → Postgres
- Copy the connection string (it should start with `postgresql://`)

**If using external provider (Supabase, Railway, Neon, etc.):**
- Go to your database provider's dashboard
- Find the connection string in settings/credentials
- Copy the full connection string

### Step 3: Resolve the Failed Migration

After setting DATABASE_URL, you have two options:

#### Option A: Automatic (Recommended)

```bash
cd nextjs

# Pull the new DATABASE_URL
npx vercel env pull .env.local --environment=production

# Run the resolution script
npm run migrate:fix-vercel
```

#### Option B: Manual

```bash
cd nextjs

# Pull environment variables
npx vercel env pull .env.local --environment=production

# Resolve the failed migration
npx prisma migrate resolve --applied 20251226134246_add_notification_log

# Deploy remaining migrations
npx prisma migrate deploy

# Verify
npx prisma migrate status
```

### Step 4: Trigger New Deployment

After resolving the migration:

1. **Push any remaining changes:**
   ```bash
   git push
   ```

2. **Or trigger a redeploy in Vercel:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click the three dots on the latest deployment
   - Select "Redeploy"

3. **Monitor the build:**
   - Watch the deployment logs
   - The build should now succeed with DATABASE_URL set

## Verification

After setting DATABASE_URL and resolving the migration:

1. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```
   Should show: `Database schema is up to date!`

2. **Verify build:**
   ```bash
   npm run build
   ```
   Should complete without errors

3. **Check Vercel deployment:**
   - Go to Vercel Dashboard → Deployments
   - Latest deployment should show "Ready" status

## Quick Command Reference

```bash
# 1. Pull environment variables
npx vercel env pull .env.local --environment=production

# 2. Resolve failed migration
npx prisma migrate resolve --applied 20251226134246_add_notification_log

# 3. Deploy migrations
npx prisma migrate deploy

# 4. Verify
npx prisma migrate status
```

## Important Notes

- **DATABASE_URL must be set** before migrations can run
- The connection string must be PostgreSQL (not SQLite)
- After setting DATABASE_URL, you must resolve the failed migration
- The safe migration will ensure everything is correct even if partially applied

---

**Next Step:** Set DATABASE_URL in Vercel Dashboard, then run the resolution commands above.

