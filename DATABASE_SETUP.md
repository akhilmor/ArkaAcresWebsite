# Database Setup for Vercel Production

## Quick Answer: Use Vercel Postgres (Easiest)

1. Go to your Vercel project dashboard
2. Click on **"Storage"** tab (or "Databases")
3. Click **"Create Database"** → Select **"Postgres"**
4. Choose a name and region
5. Click **"Create"**
6. **Done!** Vercel automatically adds `DATABASE_URL` to your environment variables

No manual connection string needed - Vercel handles it automatically!

---

## Alternative: Manual Database Setup

If you prefer a different provider, here's how to get the connection string:

### Supabase (Free Tier)

1. Go to https://supabase.com
2. Sign up / Log in
3. Create a new project
4. Wait for database to provision (~2 minutes)
5. Go to **Project Settings** → **Database**
6. Scroll to **"Connection string"** section
7. Copy the **URI** format (not the pooler)
8. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

**Note:** Replace `[YOUR-PASSWORD]` with your actual database password (found in same page)

### Neon (Free Tier)

1. Go to https://neon.tech
2. Sign up / Log in
3. Create a new project
4. Wait for database to provision
5. Copy the connection string from the dashboard
6. Format: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

### Railway

1. Go to https://railway.app
2. Sign up / Log in
3. Create a new project
4. Add **PostgreSQL** database
5. Click on the database → **"Connect"** tab
6. Copy the **Postgres Connection URL**
7. Format: `postgresql://postgres:[password]@[host]:[port]/railway`

---

## Connection String Format

All PostgreSQL connection strings follow this format:

```
postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
```

**Example:**
```
postgresql://postgres:mySecurePassword123@db.abc123.supabase.co:5432/postgres?sslmode=require
```

**Important:**
- Replace `[user]`, `[password]`, `[host]`, `[port]`, `[database]` with actual values
- Keep `?sslmode=require` for secure connections
- Never commit connection strings to Git (use environment variables only)

---

## After Setting Up Database

1. **Add to Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `DATABASE_URL` with your connection string
   - Select **Production** (and **Preview** if needed)
   - Click **Save**

2. **Run Migrations:**
   - Vercel will automatically run `prisma migrate deploy` during build
   - Or run manually: `DATABASE_URL="your-connection-string" npx prisma migrate deploy`

3. **Seed Data (optional):**
   - Run: `DATABASE_URL="your-connection-string" npm run db:seed`

4. **Verify:**
   - Deploy your app
   - Visit `https://yourdomain.com/api/health`
   - Should show `"db": "ok"`

---

## Recommendation

**Use Vercel Postgres** - It's the easiest option because:
- ✅ No manual connection string needed
- ✅ Automatically connected to your Vercel project
- ✅ Free tier available
- ✅ Managed by Vercel (less to worry about)
- ✅ `DATABASE_URL` is automatically set

