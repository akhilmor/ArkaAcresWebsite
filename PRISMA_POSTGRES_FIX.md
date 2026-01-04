# Prisma PostgreSQL Fix - Summary

## Problem
Vercel build failed with error: `P1013: datasource.url in prisma.config.ts is invalid: must start with protocol file:`

This occurred because:
- `prisma/schema.prisma` had `provider = "sqlite"` hardcoded
- Vercel uses PostgreSQL (`DATABASE_URL` = `postgresql://...`)
- Prisma requires the provider in schema.prisma to match the database URL protocol

## Solution Applied

### 1. Changed Schema Provider to PostgreSQL
**File:** `prisma/schema.prisma`

**Changed:**
```prisma
// Before:
datasource db {
  provider = "sqlite"
}

// After:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Why:** Prisma schema provider must match the database URL. Since Vercel uses Postgres, the schema must use `postgresql` provider.

### 2. Updated Migration Lock
**File:** `prisma/migrations/migration_lock.toml`

**Changed:**
```toml
# Before:
provider = "sqlite"

# After:
provider = "postgresql"
```

**Why:** Migration lock file tracks which provider was used for migrations. Must match schema provider.

### 3. Removed SQLite Adapter Code
**File:** `src/lib/prisma.ts`

**Changed:**
- Removed `@prisma/adapter-better-sqlite3` imports
- Removed `better-sqlite3` Database initialization
- Removed SQLite-specific adapter setup
- Now uses standard `PrismaClient()` initialization (works with PostgreSQL)
- Added validation to reject `file:` URLs (SQLite)

**Why:** Since schema now uses PostgreSQL provider, we can't use SQLite adapter. Standard PrismaClient works with PostgreSQL.

### 4. Updated prisma.config.ts
**File:** `prisma.config.ts`

**Changed:**
- Removed `datasource: { url: ... }` override
- Schema.prisma now handles the URL directly via `env("DATABASE_URL")`

**Why:** Avoid conflicts. Schema.prisma is the source of truth for datasource configuration.

## Important Notes

### ⚠️ Local Development Now Requires PostgreSQL

**Before:** Local dev could use SQLite (`file:./dev.db`)

**Now:** Local dev MUST use PostgreSQL (same as production)

**Options for Local Development:**
1. **Local Postgres** (if installed):
   ```bash
   # Create database
   createdb arka_acres_dev
   
   # Set DATABASE_URL in .env.local
   DATABASE_URL="postgresql://localhost:5432/arka_acres_dev"
   ```

2. **Docker Postgres** (recommended):
   ```bash
   # Run Postgres in Docker
   docker run --name postgres-arkaacres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=arkaacres -p 5432:5432 -d postgres:15
   
   # Set DATABASE_URL in .env.local
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/arkaacres"
   ```

3. **Cloud Postgres (Free Tier)**:
   - Supabase (https://supabase.com) - Free tier
   - Neon (https://neon.tech) - Free tier
   - Railway (https://railway.app) - Free tier
   
   Get connection string from provider and set in `.env.local`

### Running Migrations Locally

**First time setup:**
```bash
# Ensure DATABASE_URL is set to PostgreSQL in .env.local
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

**For existing database:**
```bash
# If you have existing migrations, deploy them
npx prisma migrate deploy

# Or push schema (development only)
npm run db:push
```

## Files Changed

1. ✅ `prisma/schema.prisma` - Changed provider to `postgresql`, added `url = env("DATABASE_URL")`
2. ✅ `prisma/migrations/migration_lock.toml` - Changed provider to `postgresql`
3. ✅ `src/lib/prisma.ts` - Removed SQLite adapter, use standard PrismaClient
4. ✅ `prisma.config.ts` - Removed datasource URL override

## Verification Checklist

### ✅ Local Development

1. **Set DATABASE_URL to PostgreSQL:**
   ```bash
   # In .env.local
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

2. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

3. **Run Migrations:**
   ```bash
   npm run db:migrate
   # OR for first time: npx prisma migrate dev
   ```

4. **Seed Database:**
   ```bash
   npm run db:seed
   ```

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```

6. **Verify:**
   - App starts without errors
   - Database queries work
   - Admin panel works
   - Bookings work

### ✅ Vercel Production

1. **Set DATABASE_URL in Vercel:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Format: `postgresql://user:password@host:5432/dbname?sslmode=require`

2. **Deploy:**
   - Push to GitHub (auto-deploys) OR
   - Redeploy manually from Vercel dashboard

3. **Verify Build:**
   - Check Vercel build logs
   - Should see: `✔ Generated Prisma Client`
   - Should see: `✔ Applied migration: ...`
   - Build should complete successfully

4. **Verify Runtime:**
   - Visit `/api/health` - should show `"db": "ok"`
   - Test admin login
   - Test booking creation
   - Check Vercel function logs for errors

## Troubleshooting

### Error: "DATABASE_URL must be a PostgreSQL connection string"

**Cause:** You're using SQLite URL (`file:./dev.db`)

**Fix:** Set `DATABASE_URL` to a PostgreSQL connection string in `.env.local`

### Error: "P1001: Can't reach database server"

**Cause:** PostgreSQL server not running or connection string incorrect

**Fix:**
1. Check PostgreSQL is running: `pg_isready` or check Docker container
2. Verify connection string format
3. Check firewall/network settings

### Error: "P3005: database schema is not empty"

**Cause:** Database has existing tables but migrations haven't been applied

**Fix:**
- Fresh database: Use a new/empty database
- Existing database: Run `npx prisma migrate deploy` to apply migrations
- Or: Use `npx prisma migrate reset` (WARNING: deletes all data)

### Error: "P1013: datasource.url is invalid"

**Cause:** DATABASE_URL format is incorrect

**Fix:**
- Ensure URL starts with `postgresql://` (not `postgres://` or `file:`)
- Format: `postgresql://user:password@host:port/database?sslmode=require`
- Check for special characters in password (URL encode if needed)

## Migration from SQLite to PostgreSQL

If you have existing SQLite data, you'll need to:

1. **Export data from SQLite:**
   ```bash
   # Use Prisma Studio or custom script
   npx prisma studio
   ```

2. **Set up PostgreSQL database**

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Import data:**
   - Use Prisma Client scripts
   - Or use database migration tools
   - Or manually recreate (for small datasets)

## Summary

✅ Schema now uses PostgreSQL provider (matches Vercel production)
✅ Migration lock updated to PostgreSQL
✅ Prisma client initialization simplified (standard PrismaClient)
✅ prisma.config.ts cleaned up (no conflicts)
✅ Local dev now requires PostgreSQL (consistent with production)

**Result:** Vercel builds will succeed because schema provider matches DATABASE_URL protocol.

