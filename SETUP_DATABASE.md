# Setting Up DATABASE_URL for Vercel Deployment

## Quick Setup Guide

You need to set `DATABASE_URL` in Vercel before migrations can run. Here are your options:

## Option 1: Use Vercel Postgres (Easiest - Recommended)

### Step 1: Create Vercel Postgres Database

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project: `nextjs`

2. **Create Postgres Database:**
   - Click **Storage** tab (or **Add** → **Storage**)
   - Select **Postgres**
   - Click **Create**
   - Choose a name for your database
   - Select a region (closest to your users)
   - Click **Create Database**

3. **Get Connection String:**
   - Once created, go to **Storage** → Your Postgres database
   - Click **.env.local** tab
   - Copy the `POSTGRES_URL` value
   - This is your `DATABASE_URL`

### Step 2: Set DATABASE_URL Environment Variable

1. **In Vercel Dashboard:**
   - Go to **Settings** → **Environment Variables**
   - Click **Add New**
   - **Name:** `DATABASE_URL`
   - **Value:** Paste the `POSTGRES_URL` you copied
   - **Environment:** Select **Production** (and Preview/Development if desired)
   - Click **Save**

### Step 3: Run Migration Resolution

After setting DATABASE_URL:

```bash
cd nextjs
npm run migrate:auto-resolve
```

This will automatically:
- Pull DATABASE_URL from Vercel
- Resolve the failed migration
- Deploy remaining migrations
- Verify everything is correct

## Option 2: Use External PostgreSQL Provider

### Providers You Can Use:

- **Supabase** (Free tier available): https://supabase.com
- **Neon** (Free tier available): https://neon.tech
- **Railway** (Free tier available): https://railway.app
- **Render** (Free tier available): https://render.com
- **AWS RDS**, **Google Cloud SQL**, etc.

### Step 1: Create Database

1. Sign up for your chosen provider
2. Create a new PostgreSQL database
3. Copy the connection string (format: `postgresql://user:password@host:port/database?sslmode=require`)

### Step 2: Set DATABASE_URL in Vercel

1. **In Vercel Dashboard:**
   - Go to **Settings** → **Environment Variables**
   - Click **Add New**
   - **Name:** `DATABASE_URL`
   - **Value:** Your PostgreSQL connection string
   - **Environment:** Select **Production** (and Preview/Development if desired)
   - Click **Save**

### Step 3: Run Migration Resolution

```bash
cd nextjs
npm run migrate:auto-resolve
```

## Option 3: Use Existing Database

If you already have a PostgreSQL database:

1. Get your connection string from your database provider
2. Set it in Vercel Dashboard → Settings → Environment Variables
3. Run: `npm run migrate:auto-resolve`

## After Setting DATABASE_URL

Once `DATABASE_URL` is set in Vercel:

1. **Pull environment variables:**
   ```bash
   npx vercel env pull .env.local
   ```

2. **Run automated resolution:**
   ```bash
   npm run migrate:auto-resolve
   ```

   Or manually:
   ```bash
   npx prisma migrate resolve --applied 20251226134246_add_notification_log
   npx prisma migrate deploy
   npx prisma migrate status
   ```

3. **Push changes and redeploy:**
   ```bash
   git push
   ```

   Vercel will automatically redeploy with the new DATABASE_URL.

## Verification

After setup, verify everything works:

```bash
# Check migration status
npx prisma migrate status

# Should show: "Database schema is up to date!"

# Test build locally
npm run build

# Should complete without errors
```

## Troubleshooting

### "DATABASE_URL not found"
- Ensure you set it in Vercel Dashboard → Settings → Environment Variables
- Make sure you selected the correct environment (Production/Preview/Development)
- After setting, pull env vars: `npx vercel env pull .env.local`

### "Connection refused" or "Cannot connect"
- Verify your connection string is correct
- Check if your database allows connections from Vercel's IPs
- For some providers, you may need to whitelist Vercel's IP addresses
- Ensure SSL is enabled: add `?sslmode=require` to connection string

### "Migration already applied"
- This is fine if the table exists
- The safe migration will ensure everything is correct

### "Table already exists"
- The migration partially succeeded
- Run: `npx prisma migrate resolve --applied 20251226134246_add_notification_log`
- Then: `npx prisma migrate deploy`

---

**Recommended:** Use Vercel Postgres for the easiest setup and automatic connection string management.

