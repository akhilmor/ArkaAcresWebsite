# Resolving Failed Migration on Vercel

## Quick Resolution (Recommended)

### Option 1: Using Vercel CLI (Easiest)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   cd nextjs
   vercel link
   ```

4. **Pull environment variables** (to get DATABASE_URL):
   ```bash
   vercel env pull .env.local
   ```

5. **Run the resolution script**:
   ```bash
   npm run migrate:fix-vercel
   ```

   Or manually:
   ```bash
   npx prisma migrate resolve --applied 20251226134246_add_notification_log
   npx prisma migrate deploy
   ```

6. **Push changes** (if not already pushed):
   ```bash
   git push
   ```

### Option 2: Using Vercel Dashboard + Local Connection

1. **Get DATABASE_URL from Vercel**:
   - Go to Vercel Dashboard → Your Project
   - Settings → Environment Variables
   - Copy the `DATABASE_URL` value

2. **Set DATABASE_URL locally**:
   ```bash
   export DATABASE_URL="postgresql://user:password@host:port/database"
   ```

3. **Resolve the migration**:
   ```bash
   npx prisma migrate resolve --applied 20251226134246_add_notification_log
   ```

4. **Deploy remaining migrations**:
   ```bash
   npx prisma migrate deploy
   ```

5. **Verify**:
   ```bash
   npx prisma migrate status
   ```

6. **Push to trigger new deployment**:
   ```bash
   git push
   ```

### Option 3: Direct Database Access (Advanced)

If you have direct access to your PostgreSQL database:

1. **Connect to your database** using your preferred PostgreSQL client

2. **Check if NotificationLog table exists**:
   ```sql
   SELECT EXISTS (
       SELECT FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name = 'NotificationLog'
   );
   ```

3. **If table exists, mark migration as applied**:
   ```sql
   -- Check current migration status
   SELECT migration_name, finished_at, applied_steps_count, rolled_back_at
   FROM _prisma_migrations
   WHERE migration_name = '20251226134246_add_notification_log';
   
   -- If the migration shows as failed but table exists, you can manually update:
   -- (Only do this if you're confident the table structure is correct)
   UPDATE _prisma_migrations
   SET finished_at = NOW(),
       applied_steps_count = 1,
       rolled_back_at = NULL
   WHERE migration_name = '20251226134246_add_notification_log'
     AND finished_at IS NULL;
   ```

4. **Then run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

## What Happens Next

After resolving the migration:

1. ✅ The failed migration `20251226134246_add_notification_log` is marked as applied
2. ✅ The safe migration `20260105141500_fix_notification_log_safe` will run
3. ✅ This ensures the table and all indexes exist correctly
4. ✅ Vercel build will succeed

## Verification

After resolving, verify the migration status:

```bash
npx prisma migrate status
```

You should see:
```
Database schema is up to date!
```

## Troubleshooting

### Error: "Migration not found"
The migration name might be slightly different. Check with:
```bash
npx prisma migrate status
```

### Error: "Cannot connect to database"
- Verify `DATABASE_URL` is set correctly
- Check if your IP is whitelisted (for some hosted databases)
- Verify database credentials

### Error: "Table already exists"
This means the table was created but migration wasn't marked complete. Use:
```bash
npx prisma migrate resolve --applied 20251226134246_add_notification_log
```

### Error: "Foreign key constraint fails"
The `Booking` table might not exist. Check:
```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'Booking'
);
```

If `Booking` doesn't exist, run earlier migrations first.

## After Resolution

Once the migration is resolved:

1. ✅ Push any remaining changes to GitHub
2. ✅ Vercel will automatically trigger a new deployment
3. ✅ Monitor the deployment logs in Vercel dashboard
4. ✅ Verify the application works correctly

The safe migration (`20260105141500_fix_notification_log_safe`) will ensure everything is in the correct state, even if the original migration partially succeeded.

