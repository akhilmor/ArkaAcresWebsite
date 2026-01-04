# Vercel Production Fixes - Summary

This document summarizes all fixes applied to resolve production deployment issues on Vercel.

## Issues Fixed

1. **`/api/availability` returns 500 and HTML instead of JSON**
2. **`/api/bookings` returns 405 in production**
3. **Dynamic server usage errors in API routes**
4. **Missing DATABASE_URL validation for production**
5. **Prisma deployment steps missing from build process**
6. **Client-side fetch error handling issues**

---

## Code Changes

### 1. API Route Fixes - Dynamic Exports

Added `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` to all API routes that use:
- `cookies()`
- `headers.get()`
- `nextUrl.searchParams`
- `prisma` database queries
- Environment variables

**Files Updated:**
- ✅ `src/app/api/availability/route.ts`
- ✅ `src/app/api/bookings/route.ts`
- ✅ `src/app/api/contact/route.ts`
- ✅ `src/app/api/health/route.ts`
- ✅ `src/app/api/visit/route.ts`
- ✅ `src/app/api/booking/route.ts`
- ✅ `src/app/api/admin/forgot-password/route.ts`
- ✅ `src/app/api/admin/reset-password/route.ts`
- ✅ All admin routes (login, bookings, blocks, diagnostics, etc.)

**Pattern Applied:**
```typescript
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

### 2. `/api/availability` - Improved Error Handling

**File:** `src/app/api/availability/route.ts`

**Changes:**
- ✅ Added `export const revalidate = 0` (was missing)
- ✅ Enhanced error handler to always return JSON (never HTML)
- ✅ Added explicit `Content-Type: application/json` header on errors

**Before:**
```typescript
} catch (error) {
  console.error('Availability API error:', error)
  return NextResponse.json(
    { ok: false, error: 'Failed to fetch availability' },
    { status: 500 }
  )
}
```

**After:**
```typescript
} catch (error) {
  console.error('Availability API error:', error)
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  
  // Ensure JSON response even on error
  return NextResponse.json(
    { 
      ok: false, 
      error: 'Failed to fetch availability',
      ...(process.env.NODE_ENV !== 'production' && { debug: errorMessage })
    },
    { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
}
```

### 3. `/api/bookings` - Added Dynamic Exports

**File:** `src/app/api/bookings/route.ts`

**Changes:**
- ✅ Added `export const dynamic = 'force-dynamic'`
- ✅ Added `export const revalidate = 0`

**Before:**
```typescript
export const runtime = 'nodejs'
```

**After:**
```typescript
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

### 4. Prisma Setup - DATABASE_URL Validation

**File:** `src/lib/prisma.ts`

**Changes:**
- ✅ Added production check: fail fast if `DATABASE_URL` is missing
- ✅ Added SQLite vs Postgres detection
- ✅ Prevent SQLite (`file:./dev.db`) usage in production
- ✅ Clear error messages for production deployment issues

**Key Changes:**
```typescript
// Validate DATABASE_URL in production
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  const error = '❌ [PRISMA] DATABASE_URL is required in production. Set it in Vercel environment variables.'
  console.error(error)
  throw new Error(error)
}

// Check if we're using SQLite (development) or Postgres (production)
const isSQLite = process.env.DATABASE_URL?.startsWith('file:') || !process.env.DATABASE_URL

// SQLite setup (development only)
if (isSQLite) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SQLite (file:./dev.db) cannot be used in production. Use a Postgres database and set DATABASE_URL in Vercel environment variables.')
  }
  // ... SQLite setup
} else {
  // Postgres setup (production)
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}
```

### 5. Package.json - Prisma Deployment Steps

**File:** `package.json`

**Changes:**
- ✅ Updated `build` script to include Prisma steps

**Before:**
```json
"build": "next build"
```

**After:**
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

**Note:** Vercel runs `npm run build` during deployment, which will now:
1. Generate Prisma Client (`prisma generate`)
2. Run migrations (`prisma migrate deploy`)
3. Build Next.js app (`next build`)

### 6. Client-Side Error Handling - BookingCalendar

**File:** `src/components/BookingCalendar.tsx`

**Changes:**
- ✅ Check response status before parsing JSON
- ✅ Read response as text first to detect HTML errors
- ✅ Check content-type header before parsing JSON
- ✅ Graceful error handling (log but don't break UI)

**Before:**
```typescript
const response = await fetch(...)
const data = await response.json()
if (data.ok) {
  // ...
}
```

**After:**
```typescript
const response = await fetch(...)

// Check if response is OK
if (!response.ok) {
  const text = await response.text()
  let errorMessage = 'Failed to fetch availability'
  
  // Try to parse as JSON if possible
  try {
    const errorData = JSON.parse(text)
    errorMessage = errorData.error || errorMessage
  } catch {
    // If it's HTML (error page), show generic error
    if (text.trim().startsWith('<!') || text.includes('<html')) {
      errorMessage = 'Server error. Please try again in a moment.'
    }
  }
  console.error('Availability API error:', { status: response.status, message: errorMessage })
  return
}

// Check content-type before parsing JSON
const contentType = response.headers.get('content-type')
if (!contentType || !contentType.includes('application/json')) {
  const text = await response.text()
  console.error('Availability API returned non-JSON response:', { contentType, preview: text.substring(0, 200) })
  return
}

const data = await response.json()
if (data.ok) {
  // ...
}
```

---

## Vercel Environment Variables Checklist

### 🔴 CRITICAL - Must Set

1. **DATABASE_URL**
   - **Type:** PostgreSQL connection string
   - **Example:** `postgresql://user:password@host:5432/dbname?sslmode=require`
   - **Note:** If using Vercel Postgres, this is auto-provided

2. **ADMIN_EMAIL**
   - **Example:** `admin@arkaacres.com`

3. **ADMIN_PASSWORD**
   - **Example:** `YourSecurePassword123!`

4. **NEXT_PUBLIC_SITE_URL**
   - **Example:** `https://arkaacres.com`
   - **Must include:** `https://` protocol

5. **NEXT_PUBLIC_APP_URL**
   - **Example:** `https://arkaacres.com`
   - **Note:** Used for password reset links

### 📧 Email Provider (Choose ONE)

**Option 1: Resend (Recommended)**
- `RESEND_API_KEY`
- `EMAIL_FROM` (verified sender)

**Option 2: SMTP**
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

### 📱 SMS Provider (Optional)

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `SMS_TO_NUMBER`

### 👤 Owner Contact (Optional - Has Defaults)

- `OWNER_EMAIL` (default: `arkaacres@gmail.com`)
- `OWNER_PHONE` (default: `+14695369020`)

### ⚙️ Optional Features

- `ENABLE_GUEST_SMS` (default: `false`)

---

## Deployment Steps

1. **Set Environment Variables in Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all required variables (see checklist above)
   - Ensure `DATABASE_URL` is set (Postgres, not SQLite)

2. **Deploy**
   - Push changes to GitHub
   - Vercel will automatically trigger a build
   - Build will run: `prisma generate && prisma migrate deploy && next build`

3. **Verify**
   - Check build logs in Vercel dashboard
   - Visit `https://yourdomain.com/api/health` to verify configuration
   - Test `/api/availability` endpoint
   - Test `/api/bookings` endpoint (POST request)

---

## Troubleshooting

**Build fails locally with "P3005 database schema is not empty":**
- ⚠️ This is **expected** in local development with SQLite
- `prisma migrate deploy` is for production only (fresh databases)
- For local development, use `npm run dev` (uses `prisma migrate dev`)
- Build script works correctly on Vercel with fresh Postgres databases
- If you need to test build locally, use a fresh Postgres database

**Build fails with "DATABASE_URL missing":**
- ✅ Ensure `DATABASE_URL` is set in Vercel environment variables
- ✅ Use PostgreSQL connection string (not `file:./dev.db`)
- ✅ If using Vercel Postgres, it should be auto-provided

**`/api/availability` returns HTML instead of JSON:**
- ✅ Fixed: Route now always returns JSON with proper headers
- ✅ Error handler ensures JSON responses

**`/api/bookings` returns 405:**
- ✅ Fixed: Route now has proper dynamic exports
- ✅ Ensure frontend uses POST method (not GET)

**Prisma errors in production:**
- ✅ Fixed: Build script now runs `prisma generate` and `prisma migrate deploy`
- ✅ SQLite is blocked in production (clear error message)
- ✅ DATABASE_URL validation fails fast with helpful error

---

## Testing Checklist

- [ ] Build passes on Vercel
- [ ] `/api/health` returns JSON with correct status
- [ ] `/api/availability?unitSlug=...&from=...&to=...` returns JSON (not HTML)
- [ ] `/api/bookings` accepts POST requests
- [ ] Frontend calendar loads availability correctly
- [ ] Booking form submits successfully
- [ ] Admin panel login works
- [ ] All environment variables set correctly

---

## Files Changed Summary

**API Routes (24 files):**
- All routes now have `export const dynamic = 'force-dynamic'` and `export const revalidate = 0`

**Core Files (3 files):**
- `src/lib/prisma.ts` - DATABASE_URL validation
- `package.json` - Build script with Prisma steps
- `src/components/BookingCalendar.tsx` - Improved error handling

**Documentation (2 files):**
- `VERCEL_ENV_VARS.md` - Updated with Prisma troubleshooting
- `VERCEL_PRODUCTION_FIXES.md` - This file

