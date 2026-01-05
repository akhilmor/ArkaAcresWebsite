# How to Run Migration Resolution in Vercel

## Option 1: Run Locally Against Production Database (Recommended)

The `migrate:auto-resolve` script connects to your **production database** (using DATABASE_URL from Vercel), so you can run it from your local machine:

### Step 1: Set DATABASE_URL in Vercel (if not already set)

1. Go to https://vercel.com/dashboard
2. Select your project → **Settings** → **Environment Variables**
3. Add `DATABASE_URL` with your PostgreSQL connection string
4. Save

### Step 2: Run the Script Locally

```bash
cd nextjs

# The script will automatically pull DATABASE_URL from Vercel
npm run migrate:auto-resolve
```

This script will:
- Pull `DATABASE_URL` from Vercel automatically
- Connect to your production database
- Resolve the failed migration
- Deploy remaining migrations
- Verify everything is correct

**Note:** Even though you run it locally, it's working on your **production database** in Vercel.

---

## Option 2: Run During Vercel Build (Automatic)

Once `DATABASE_URL` is set in Vercel, migrations will run automatically during deployment. However, you still need to resolve the failed migration first.

### Step 1: Resolve Failed Migration (One-time)

Run this locally first (Option 1 above) to resolve the failed migration state.

### Step 2: Future Deployments

After the failed migration is resolved, Vercel will automatically run:
```bash
prisma generate && prisma migrate deploy && next build
```

This happens automatically on every deployment because it's in your `package.json` build script.

---

## Option 3: Use Vercel CLI to Execute Commands

You can also use Vercel CLI to run commands in the Vercel environment:

### Step 1: Pull Environment Variables

```bash
cd nextjs
npx vercel env pull .env.local
```

### Step 2: Run Migration Commands

```bash
# Resolve the failed migration
npx prisma migrate resolve --applied 20251226134246_add_notification_log

# Deploy remaining migrations
npx prisma migrate deploy

# Verify
npx prisma migrate status
```

These commands will use the `DATABASE_URL` from `.env.local` (which you pulled from Vercel), so they're connecting to your production database.

---

## Option 4: Override Build Command in Vercel (Advanced)

If you want to run the resolution script during the Vercel build:

1. Go to Vercel Dashboard → Your Project → **Settings** → **General**
2. Under **Build & Development Settings**, find **Build Command**
3. Override it with:
   ```bash
   npm run migrate:auto-resolve && next build
   ```

**⚠️ Warning:** This will run the resolution on every build, which is usually not needed after the first time.

---

## Recommended Workflow

### First Time (Resolve Failed Migration):

1. **Set DATABASE_URL in Vercel Dashboard** (if not set)
2. **Run locally:**
   ```bash
   cd nextjs
   npm run migrate:auto-resolve
   ```
3. **Push any changes:**
   ```bash
   git push
   ```
4. **Vercel will automatically deploy** and migrations will be up to date

### Future Deployments:

- Just push to GitHub
- Vercel automatically runs `prisma migrate deploy` during build
- No manual steps needed

---

## Troubleshooting

### "DATABASE_URL not found"
- Make sure you set it in Vercel Dashboard → Settings → Environment Variables
- The script will try to pull it automatically, but you can also run:
  ```bash
  npx vercel env pull .env.local
  ```

### "Cannot connect to database"
- Verify your DATABASE_URL is correct
- Check if your database allows connections from your IP (some providers require IP whitelisting)
- Ensure SSL is enabled: connection string should include `?sslmode=require`

### "Migration already applied"
- This is fine! The migration was already resolved
- Run: `npx prisma migrate status` to verify

---

## Summary

**Easiest approach:** Run `npm run migrate:auto-resolve` locally after setting DATABASE_URL in Vercel. It connects to your production database and resolves everything automatically.

**After that:** Vercel will handle migrations automatically on every deployment via the build script.

