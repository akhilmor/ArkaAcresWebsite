# Arka Acres - Booking & Notification System

A production-ready booking system for Arka Acres with availability calendar, overlap prevention, resource groups, and email/SMS notifications.

## Features

- ✅ **Airbnb-style booking calendar** with real-time availability
- ✅ **Overlap prevention** - prevents double booking (server-side validation)
- ✅ **Resource groups** - Aurora Grand and White House share availability (cannot overlap)
- ✅ **Immediate HOLD blocks** - bookings create BlockedDateRange entries atomically
- ✅ **Email notifications** - Resend API with SMTP fallback
- ✅ **SMS notifications** - Twilio integration (owner only)
- ✅ **Admin panel** - manage bookings, blocks, resend notifications
- ✅ **1-night stays** - automatically normalized (checkOut = checkIn + 1 day)
- ✅ **Event time windows** - Aurora Grand events check time overlap
- ✅ **Production-ready** - error handling, logging, diagnostics

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Prisma** (SQLite dev, PostgreSQL prod-ready)
- **TailwindCSS** + shadcn/ui
- **Resend** (email) + **Nodemailer** (SMTP fallback)
- **Twilio** (SMS)

## Dev Troubleshooting

If you see build errors like "Cannot find module './####.js'" or 404s for CSS/chunk files:

1. **Stop the dev server** (Ctrl+C)
2. **Clean build cache:**
   ```bash
   npm run clean
   ```
3. **Restart dev server:**
   ```bash
   npm run dev
   ```

If issues persist:
```bash
npm run reinstall
npm run dev
```

**Note:** Always run `npm run dev` from the `nextjs` folder (where `package.json` is located).

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

**Note:** The `postinstall` script automatically generates the Prisma client. If you see Prisma errors, run:
```bash
npm run db:generate
```

### 2. Set Up Database

```bash
# Push schema to database
npm run db:push

# Seed units (The White House, Aurora Grand, Red Roost)
npm run db:seed
```

### 3. Verify Prisma Client

```bash
# Check that Prisma client is generated
ls node_modules/.prisma/client

# Should show: index.js, index.d.ts, and other files
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in:

**Verify configuration:**
```bash
npm run verify:config
```

This will show which providers (Resend/SMTP/Twilio) are configured.

```bash
# Required
DATABASE_URL=file:./dev.db
ADMIN_PASSWORD=your-secure-password

# Owner contact (defaults provided)
OWNER_EMAIL=arkaacres@gmail.com
OWNER_PHONE=+14695369020

# Email Provider (choose ONE)
# Option 1: Resend (Recommended)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=bookings@arkaacres.org

# Option 2: SMTP Fallback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Provider (Twilio - Optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890

# Optional
ENABLE_GUEST_SMS=false
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Environment Variables

### Required

- `DATABASE_URL` - Prisma database connection string
- `ADMIN_PASSWORD` - Password for `/admin` panel

### Owner Contact (Defaults Provided)

- `OWNER_EMAIL` - Email to receive booking notifications (default: `arkaacres@gmail.com`)
- `OWNER_PHONE` - Phone number for SMS notifications (default: `+14695369020`)

### Email Provider (Choose ONE)

**Option 1: Resend (Recommended)**
- `RESEND_API_KEY` - Get from https://resend.com/api-keys
- `EMAIL_FROM` - Verified sender email (e.g., `bookings@arkaacres.org`)

**Option 2: SMTP Fallback**
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP port (587 for TLS, 465 for SSL)
- `SMTP_SECURE` - `true` for SSL (port 465), `false` for TLS (port 587)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password (use app password for Gmail)

**Note:** If both Resend and SMTP are configured, Resend is tried first, then SMTP fallback.

### SMS Provider (Optional)

- `TWILIO_ACCOUNT_SID` - Get from https://console.twilio.com/
- `TWILIO_AUTH_TOKEN` - Get from https://console.twilio.com/
- `TWILIO_FROM_NUMBER` - Your Twilio phone number (E.164 format, e.g., `+1234567890`)

### Optional

- `ENABLE_GUEST_SMS` - Enable SMS receipts for guests (default: `false`)
- `NEXT_PUBLIC_SITE_URL` - Site URL for email links (default: `http://localhost:3000`)

## Database Schema

### Units

- `the-white-house` (stay, 4 bedrooms, sleeps 15, resourceGroup: `main-campus`)
- `aurora-grand` (event, resourceGroup: `main-campus`)
- `red-roost` (stay, studio, resourceGroup: `red-roost-group`)

### Resource Groups

- **main-campus**: Aurora Grand and White House share availability (cannot overlap)
- **red-roost-group**: Red Roost is independent

### Booking Flow

1. User selects dates/times on calendar
2. Server validates availability (checks bookings + blocks + resource groups)
3. If available, creates booking + BlockedDateRange HOLD in **single transaction**
4. Sends notifications (email to owner + guest, SMS to owner)
5. Updates booking status fields (`ownerEmailStatus`, `guestEmailStatus`, etc.)

## API Routes

### Public

- `POST /api/bookings` - Create booking
- `GET /api/availability?unitSlug=...&from=...&to=...` - Get availability calendar
- `GET /api/health` - Health check (provider status)

### Admin (Password Protected)

- `GET /api/admin/bookings` - List all bookings
- `POST /api/admin/bookings/:id/status` - Update booking status
- `POST /api/admin/bookings/:id/resend-email` - Resend owner email
- `POST /api/admin/bookings/:id/resend-sms` - Resend owner SMS
- `GET /api/admin/blocks` - List blocked date ranges
- `POST /api/admin/blocks` - Create manual block
- `DELETE /api/admin/blocks/:id` - Delete block
- `GET /api/admin/diagnostics` - System diagnostics

## Admin Panel

Visit `/admin` and enter the password from `ADMIN_PASSWORD`.

**Features:**
- View all bookings with notification statuses
- Confirm/cancel bookings
- Resend notifications (email/SMS)
- Create/delete blocked date ranges
- View system diagnostics

## Booking Validation

### Stays

- Check-in and check-out dates required
- Check-out must be after check-in
- **1-night stays**: If check-out = check-in, automatically set check-out = check-in + 1 day
- Guests must be between 1 and `unit.sleepsUpTo`

### Events (Aurora Grand)

- Event date required
- Start time and end time optional (but recommended)
- **Time overlap checking**: If times provided, checks if time windows overlap
- Estimated attendees required (minimum 1)

## Overlap Prevention

### Stay Bookings

- Checks date range overlap: `newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn`
- Blocks entire date range (checkIn to checkOut)

### Event Bookings

- Checks same date
- If both bookings have times, checks time window overlap: `newStart < existingEnd AND newEnd > existingStart`
- If times not provided, blocks entire day

### Resource Groups

- Aurora Grand and White House share `main-campus` group
- Booking either unit blocks the other for overlapping dates/times
- Red Roost is independent

## Notifications

### Email

1. **Resend** (if `RESEND_API_KEY` configured)
2. **SMTP fallback** (if `SMTP_HOST` configured)
3. **Mark as failed** (if neither configured)

**Templates:**
- Owner: New booking request with all details + admin link
- Guest: Receipt confirmation with booking details

### SMS

- **Twilio** (if configured)
- Owner only (guest SMS disabled by default)
- Concise summary: unit, dates/times, guest name, booking ID

### Status Tracking

Each booking tracks:
- `ownerEmailStatus`: `sent` | `failed`
- `ownerEmailError`: Error message if failed
- `ownerEmailSentAt`: Timestamp
- `ownerSmsStatus`: `sent` | `failed`
- `ownerSmsError`: Error message if failed
- `ownerSmsSentAt`: Timestamp
- `guestEmailStatus`: `sent` | `failed`
- `guestEmailError`: Error message if failed
- `guestEmailSentAt`: Timestamp

## Development

### Clean Dev Cache

```bash
npm run clean
npm run dev
```

### Database Commands

```bash
# Push schema changes
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Testing

1. **Test Booking Flow:**
   - Visit `/stay`
   - Click "Book Now" on any unit
   - Select dates (try 1-night stay)
   - Submit booking
   - Check `/admin` for booking and notification statuses

2. **Test Overlap Prevention:**
   - Book White House for a date
   - Try to book Aurora Grand for same date → should fail with 409

3. **Test Resource Groups:**
   - Book Aurora Grand for a date
   - Try to book White House for same date → should fail with 409

4. **Test Notifications:**
   - Check `/api/health` for provider status
   - Submit booking
   - Check `/admin` for notification statuses
   - Use "Resend" buttons if needed

## Production Deployment

### Deploying to Vercel + Connecting GoDaddy Domain

#### Prerequisites
- GitHub repository with your code pushed
- Vercel account (free tier works)
- GoDaddy domain account
- Email provider configured (Resend recommended) or SMTP credentials

#### Step 1: Verify Local Build

Before deploying, ensure the project builds locally:

```bash
cd nextjs
npm install
npm run build
```

**Expected output:** Build should complete successfully. You may see a warning about `/admin/reset-password` prerendering (this is expected for dynamic routes and won't affect production).

**If build fails:**
- Check for TypeScript errors: `npm run lint`
- Ensure Prisma client is generated: `npm run db:generate`
- Clean and rebuild: `npm run clean && npm run build`

#### Step 2: Deploy to Vercel

1. **Import Project:**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository: `ArkaAcresWebsite`

2. **Configure Project:**
   - **Root Directory:** Set to `nextjs` (if your Next.js app is in a subdirectory)
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

3. **Environment Variables:**
   Add all required environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add each variable from `.env.example`:
     ```
     DATABASE_URL=postgresql://... (or use Vercel Postgres)
     ADMIN_EMAIL=your-admin@example.com
     ADMIN_PASSWORD=your-secure-password
     NEXT_PUBLIC_SITE_URL=https://yourdomain.com
     NEXT_PUBLIC_APP_URL=https://yourdomain.com
     RESEND_API_KEY=re_xxxxx
     EMAIL_FROM=Arka Acres <bookings@yourdomain.com>
     OWNER_EMAIL=arkaacres@gmail.com
     OWNER_PHONE=+14695369020
     # ... (add all other vars from .env.example)
     ```
   - **Important:** Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL` to your production domain (e.g., `https://arkaacres.com`)
   - Apply to: **Production, Preview, Development** (or just Production if preferred)

4. **Database Setup:**
   - **Option A: Vercel Postgres (Recommended)**
     - In Vercel dashboard: Storage → Create Database → Postgres
     - Vercel automatically provides `DATABASE_URL` env var
     - Run migrations: Connect to Vercel Postgres and run `npx prisma migrate deploy`
   - **Option B: External PostgreSQL**
     - Use a service like Supabase, Railway, or Neon
     - Add `DATABASE_URL` as environment variable

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Vercel will provide a preview URL (e.g., `your-project.vercel.app`)

#### Step 3: Connect GoDaddy Domain

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `arkaacres.com`)
   - Vercel will show DNS records to configure

2. **In GoDaddy DNS Settings:**
   - Log in to GoDaddy
   - Go to DNS Management for your domain
   - **Add/Update these records:**
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     TTL: 600 (or default)
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     TTL: 600 (or default)
     ```
   - **Important:** If you have existing MX records for email (Gmail), **DO NOT DELETE THEM**. Keep all MX records intact.
   - Save changes

3. **Wait for DNS Propagation:**
   - DNS changes can take 5 minutes to 48 hours (usually 15-30 minutes)
   - Check propagation: [whatsmydns.net](https://www.whatsmydns.net)
   - Vercel will automatically detect when DNS is configured correctly

4. **Verify Domain:**
   - In Vercel dashboard, the domain should show "Valid Configuration"
   - Visit `https://yourdomain.com` to confirm site loads
   - Check SSL certificate is active (Vercel provides free SSL)

#### Step 4: Post-Deployment Setup

1. **Run Database Migrations:**
   ```bash
   # Connect to your production database
   DATABASE_URL="your-production-db-url" npx prisma migrate deploy
   
   # Seed initial data (units)
   DATABASE_URL="your-production-db-url" npm run db:seed
   ```

2. **Verify Production:**
   - Visit `https://yourdomain.com`
   - Check `/api/health` - should show all providers configured
   - Test booking flow end-to-end
   - Test admin panel: `/admin`
   - Verify email notifications work (test booking)

3. **Configure Email Domain (Resend):**
   - If using Resend, verify your domain in Resend dashboard
   - Add DNS records (SPF, DKIM) as shown in Resend
   - Update `EMAIL_FROM` to use verified domain

#### Step 5: Production Checklist

- ✅ **Build passes** - Verified locally with `npm run build`
- ✅ **Deploy passes** - Vercel deployment successful
- ✅ **Vercel domain added** - Domain configured in Vercel dashboard
- ✅ **GoDaddy DNS records set:**
  - A record: `@` → `76.76.21.21`
  - CNAME record: `www` → `cname.vercel-dns.com`
  - MX records preserved for Gmail (if using Gmail)
- ✅ **Environment variables set** - All required vars in Vercel
- ✅ **Database connected** - Migrations run, seed data loaded
- ✅ **SSL active** - HTTPS working (Vercel provides automatically)
- ✅ **Health check passes** - `/api/health` shows all systems configured
- ✅ **Booking flow tested** - End-to-end booking works
- ✅ **Admin panel accessible** - Can log in and manage bookings

#### Troubleshooting Deployment

**Build fails on Vercel:**
- Check build logs in Vercel dashboard
- Ensure `package.json` has correct scripts
- Verify Prisma client generates: add `postinstall: prisma generate` (already present)
- Check for TypeScript errors locally first

**Domain not resolving:**
- Verify DNS records in GoDaddy match Vercel requirements
- Wait for DNS propagation (can take up to 48 hours)
- Check DNS with: `dig yourdomain.com` or [whatsmydns.net](https://www.whatsmydns.net)

**404s for CSS/JS assets:**
- Ensure `next.config.js` doesn't have incorrect `basePath` or `assetPrefix`
- Check Vercel build logs for asset compilation errors
- Verify `NEXT_PUBLIC_SITE_URL` is set correctly

**Database connection errors:**
- Verify `DATABASE_URL` is set in Vercel environment variables
- Check database allows connections from Vercel IPs
- Run migrations: `npx prisma migrate deploy`

**Email/SMS not working:**
- Check `/api/health` endpoint for provider status
- Verify all email/SMS env vars are set in Vercel
- Check Resend/Twilio dashboards for delivery logs

## Troubleshooting

### "NO_EMAIL_PROVIDER_CONFIGURED"

- Check `/api/health` - should show `emailProvider: 'none'`
- Configure either Resend or SMTP in `.env.local`
- Restart dev server after changing env vars

### "TWILIO_NOT_CONFIGURED"

- Check `/api/health` - should show `twilioConfigured: false`
- Configure Twilio vars in `.env.local`
- SMS is optional - bookings still work without it

### Bookings Save But Notifications Fail

- Check `/admin` → booking details → notification statuses
- Check `/api/admin/diagnostics` for error logs
- Use "Resend" buttons in admin panel
- Verify provider credentials are correct

### Overlap Not Detected

- Ensure `BlockedDateRange` entries are created (check Prisma Studio)
- Check resource groups are set correctly (`npm run db:seed`)
- Verify availability endpoint returns correct disabled dates

## License

Private - Arka Acres
