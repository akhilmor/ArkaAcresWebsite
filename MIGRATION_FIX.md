# Fixing Failed Prisma Migration: `20251226134246_add_notification_log`

## Problem
The migration `20251226134246_add_notification_log` failed during Vercel deployment. This migration creates the `NotificationLog` table.

## Solution Overview
We have two options:
1. **Mark the failed migration as applied** (if the table was partially created)
2. **Use the new safe migration** that handles existing tables gracefully

## Step-by-Step Resolution

### Option 1: Resolve Failed Migration (Recommended if table exists)

#### On Vercel (via Vercel CLI or Dashboard)

1. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

2. **If the `NotificationLog` table exists but migration is marked as failed:**
   ```bash
   npx prisma migrate resolve --applied 20251226134246_add_notification_log
   ```

3. **Then deploy the new safe migration:**
   ```bash
   npx prisma migrate deploy
   ```

#### On Local (for testing)

1. **Set your DATABASE_URL to point to your production database:**
   ```bash
   export DATABASE_URL="your-postgres-connection-string"
   ```

2. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

3. **Resolve the failed migration:**
   ```bash
   npx prisma migrate resolve --applied 20251226134246_add_notification_log
   ```

4. **Deploy remaining migrations:**
   ```bash
   npx prisma migrate deploy
   ```

### Option 2: Use Safe Migration (Recommended if table doesn't exist)

The new migration `20260105141500_fix_notification_log_safe` will:
- Check if the table exists before creating it
- Create missing indexes if the table exists but indexes don't
- Use PostgreSQL-compatible syntax (TIMESTAMP instead of DATETIME)

This migration will run automatically on the next `prisma migrate deploy`.

## Verification Steps

### 1. Check if NotificationLog table exists

Connect to your PostgreSQL database and run:
```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'NotificationLog'
);
```

### 2. Check table structure

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'NotificationLog'
ORDER BY ordinal_position;
```

Expected columns:
- `id` (TEXT, NOT NULL, PRIMARY KEY)
- `bookingId` (TEXT, NOT NULL)
- `audience` (TEXT, NOT NULL)
- `channel` (TEXT, NOT NULL)
- `messageType` (TEXT, NOT NULL)
- `status` (TEXT, NOT NULL)
- `provider` (TEXT, NOT NULL)
- `providerMessageId` (TEXT, NULLABLE)
- `errorMessage` (TEXT, NULLABLE)
- `createdAt` (TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

### 3. Check indexes

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename = 'NotificationLog';
```

Expected indexes:
- `NotificationLog_bookingId_idx`
- `NotificationLog_audience_channel_messageType_idx`
- `NotificationLog_bookingId_audience_channel_messageType_status_idx`

## Testing Locally Before Deploying

1. **Set up local PostgreSQL database:**
   ```bash
   # Create a local .env file with DATABASE_URL pointing to PostgreSQL
   echo 'DATABASE_URL="postgresql://user:password@localhost:5432/arkaacres"' > .env.local
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify the build:**
   ```bash
   npm run build
   ```

4. **Test the application:**
   ```bash
   npm run dev
   ```

## Vercel Deployment

After resolving the migration:

1. **Push changes to GitHub:**
   ```bash
   git add .
   git commit -m "Fix failed NotificationLog migration with safe migration"
   git push
   ```

2. **Vercel will automatically:**
   - Run `prisma generate`
   - Run `prisma migrate deploy` (which will apply the safe migration)
   - Run `next build`

3. **Monitor the deployment logs** in Vercel dashboard to ensure:
   - `prisma migrate deploy` succeeds
   - `next build` completes without errors

## Troubleshooting

### Error: "Migration already applied"
If you see this error, the migration was successfully applied. You can verify by checking the `_prisma_migrations` table:
```sql
SELECT * FROM _prisma_migrations WHERE migration_name = '20251226134246_add_notification_log';
```

### Error: "Table already exists"
This means the table was created but the migration wasn't marked as complete. Use:
```bash
npx prisma migrate resolve --applied 20251226134246_add_notification_log
```

### Error: "Foreign key constraint fails"
This means the `Booking` table might not exist. Check:
```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'Booking'
);
```

If `Booking` doesn't exist, you need to run earlier migrations first.

## Files Changed

1. **New migration:** `prisma/migrations/20260105141500_fix_notification_log_safe/migration.sql`
   - Safe PostgreSQL-compatible migration
   - Handles existing tables gracefully

2. **Package.json:** Added `migrate:resolve` script for convenience

3. **This guide:** `MIGRATION_FIX.md`

## Next Steps

1. ✅ Resolve the failed migration using Option 1 or Option 2
2. ✅ Test locally with PostgreSQL
3. ✅ Push changes to GitHub
4. ✅ Monitor Vercel deployment
5. ✅ Verify the application works in production

