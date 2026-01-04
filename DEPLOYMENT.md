# Deployment Guide - Vercel Production

This guide provides exact steps to deploy the Arka Acres booking system to Vercel with all dynamic features working correctly.

## Prerequisites

- GitHub repository with your code
- Vercel account (sign up at https://vercel.com)
- PostgreSQL database (Vercel Postgres recommended)

---

## Step 1: Set Up Database

### Option A: Vercel Postgres (Recommended - Easiest)

1. Go to your Vercel project dashboard
2. Click **"Storage"** tab → **"Create Database"** → Select **"Postgres"**
3. Choose a name and region
4. Click **"Create"**
5. **Done!** Vercel automatically adds `DATABASE_URL` to your environment variables

### Option B: External Database (Supabase, Neon, Railway, etc.)

See `DATABASE_SETUP.md` for detailed instructions on other providers.

---

## Step 2: Configure Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

### 🔴 CRITICAL - Required

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | Auto-provided if using Vercel Postgres |
| `ADMIN_EMAIL` | `arkaacres@gmail.com` | Admin login email (fixed, cannot change) |
| `ADMIN_PASSWORD` | `YourSecurePassword123!` | Initial admin password (can be changed via reset flow) |
| `NEXT_PUBLIC_SITE_URL` | `https://arkaacres.com` | Your production domain (must include `https://`) |
| `NEXT_PUBLIC_APP_URL` | `https://arkaacres.com` | Same as NEXT_PUBLIC_SITE_URL (for password reset links) |

### 📧 Email Provider (Choose ONE)

**Option 1: Resend (Recommended)**
- `RESEND_API_KEY` - Your Resend API key
- `EMAIL_FROM` - Verified sender email (e.g., `bookings@arkaacres.com`)

**Option 2: SMTP (Gmail/Google Workspace)**
- `SMTP_HOST` - `smtp.gmail.com`
- `SMTP_PORT` - `587`
- `SMTP_SECURE` - `false`
- `SMTP_USER` - Your Gmail address
- `SMTP_PASS` - Google App Password (NOT your regular password)
- `EMAIL_FROM` - Your email address

### 📱 SMS Provider (Optional)

- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_FROM_NUMBER` - Your Twilio phone number (e.g., `+1234567890`)
- `SMS_TO_NUMBER` - Where to send notifications (e.g., `+14695369020`)

### ⚙️ Optional

- `OWNER_EMAIL` - Default: `arkaacres@gmail.com`
- `OWNER_PHONE` - Default: `+14695369020`
- `ENABLE_GUEST_SMS` - `true` or `false` (default: `false`)

**Important:**
- Select **Production** environment (and **Preview** if desired) for each variable
- `NEXT_PUBLIC_*` variables are exposed to the browser - don't put secrets here
- Never commit `.env` files to Git

---

## Step 3: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `nextjs` (if your Next.js app is in a subdirectory)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default - **NOT** `/out`)
   - **Install Command:** `npm install` (default)

**Critical:** Ensure **Output Directory** is `.next` (not `/out`). The app uses server-side rendering, not static export.

---

## Step 4: Deploy

1. Click **"Deploy"** in Vercel
2. Wait for build to complete (check build logs)
3. Vercel will automatically:
   - Install dependencies (`npm install`)
   - Generate Prisma client (`prisma generate`)
   - Run database migrations (`prisma migrate deploy`)
   - Build Next.js app (`next build`)
4. Your app will be live at `https://your-project.vercel.app`

---

## Step 5: Verify Deployment

### 5.1 Check Health Endpoint

Visit: `https://your-domain.com/api/health`

Should return JSON with:
```json
{
  "db": "ok",
  "prismaClient": "ok",
  "emailProvider": "resend" or "smtp",
  ...
}
```

### 5.2 Test API Routes

**Test `/api/availability`:**
```bash
curl "https://your-domain.com/api/availability?unitSlug=the-white-house&from=2024-01-01&to=2024-01-31"
```
Should return JSON (not HTML).

**Test `/api/bookings` (POST):**
```bash
curl -X POST https://your-domain.com/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"unitSlug":"the-white-house","name":"Test","email":"test@example.com","checkIn":"2024-01-15","checkOut":"2024-01-17","guests":"2"}'
```
Should return JSON with `"ok": true` or error details.

### 5.3 Test Admin Panel

1. Visit `https://your-domain.com/admin`
2. Login with:
   - **Email:** `arkaacres@gmail.com` (fixed)
   - **Password:** The value you set in `ADMIN_PASSWORD` env var
3. Should successfully log in and see admin dashboard

**Important:** Only `arkaacres@gmail.com` can log in. Any other email will be rejected.

### 5.4 Test Password Reset Flow

1. Visit `https://your-domain.com/admin/forgot-password`
2. Enter `arkaacres@gmail.com`
3. Check email for reset link
4. Click link → Set new password
5. Login with new password (old `ADMIN_PASSWORD` env var no longer works)

**Note:** After reset, the password stored in the database takes precedence. The `ADMIN_PASSWORD` env var is only used to create the initial admin user if one doesn't exist.

---

## Troubleshooting

### Build Fails with "DATABASE_URL missing"

- ✅ Ensure `DATABASE_URL` is set in Vercel environment variables
- ✅ If using Vercel Postgres, it should be auto-provided
- ✅ Check that environment is set to "Production"

### Build Fails with "P3005 database schema is not empty"

- ⚠️ This is **expected** in local development with SQLite
- ✅ On Vercel with fresh Postgres, this should not occur
- ✅ If you see this on Vercel, your database may have existing tables - use a fresh database or baseline migrations

### `/api/availability` Returns HTML Instead of JSON

- ✅ Fixed: Route now always returns JSON with proper headers
- ✅ Check Vercel build logs for any errors
- ✅ Verify route has `export const dynamic = 'force-dynamic'` (already added)

### `/api/bookings` Returns 405

- ✅ Fixed: Route now has proper dynamic exports
- ✅ Ensure frontend uses POST method (not GET)
- ✅ Check Vercel build logs

### Admin Login Fails

**Check logs for specific error:**

- **"Configuration error - missing environment variable":** `ADMIN_PASSWORD` env var not set
- **"Invalid email attempt":** Wrong email (only `arkaacres@gmail.com` works)
- **"Invalid password attempt":** Wrong password

**Common issues:**
- `ADMIN_PASSWORD` env var not set in Vercel
- Database migrations not run (admin user doesn't exist)
- Password reset changed password in DB, but trying to use old `ADMIN_PASSWORD` env var

**Solution:**
1. Set `ADMIN_PASSWORD` in Vercel env vars
2. Redeploy (this creates admin user if missing)
3. Login with `ADMIN_PASSWORD` value
4. OR use password reset flow if password was changed

### Admin Panel Shows 404 or Not Found

- ✅ Ensure you're visiting `/admin` (not `/admin/`)
- ✅ Check that admin routes are deployed (check Vercel build logs)
- ✅ Verify dynamic routes are enabled (already configured)

### Database Migrations Not Running

- ✅ Build script includes `prisma migrate deploy` (already configured)
- ✅ Check Vercel build logs for migration errors
- ✅ Ensure `DATABASE_URL` is accessible from Vercel

---

## Redeploy After Changes

### Automatic (Recommended)

- Push to GitHub `main` branch
- Vercel automatically detects changes and redeploys

### Manual

1. Go to Vercel Dashboard → Your Project
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on latest deployment
4. Or click **"Create Deployment"** → Enter commit hash or branch

---

## Environment-Specific Configuration

### Production

- Use production database (Vercel Postgres or external)
- Set all environment variables in Vercel Dashboard
- Use production domain in `NEXT_PUBLIC_SITE_URL`

### Preview/Development

- Can use same database or separate
- Can override env vars for preview deployments
- Use preview URL in `NEXT_PUBLIC_SITE_URL` if different

---

## Security Checklist

- ✅ `ADMIN_EMAIL` is fixed to `arkaacres@gmail.com` (cannot be changed)
- ✅ Only one admin email can log in (enforced in code)
- ✅ Passwords are hashed with bcrypt (never stored plain text)
- ✅ Password reset uses secure tokens (expires after 1 hour)
- ✅ Admin session cookies are httpOnly and secure in production
- ✅ Environment variables are never committed to Git
- ✅ `NEXT_PUBLIC_*` variables are safe for browser exposure

---

## Support

- See `VERCEL_ENV_VARS.md` for detailed environment variable reference
- See `VERCEL_PRODUCTION_FIXES.md` for technical details on fixes applied
- See `DATABASE_SETUP.md` for database setup options
- Check Vercel build logs for deployment errors
- Check `/api/health` endpoint for configuration status

