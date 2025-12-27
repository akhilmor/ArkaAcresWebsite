# Prisma Client Missing - Complete Fix Guide

## Problem
All booking endpoints return 500 errors with:
- `Error: Cannot find module '.prisma/client/default'`
- Client receives HTML error pages instead of JSON

## Root Cause
Prisma client is not generated. The `@prisma/client` package exists but the generated client code is missing.

## Complete Fix (Run These Commands)

```bash
# 1. Clean everything
cd "/Users/akhilmorusupalli/arkaacres website/nextjs"
rm -rf .next node_modules node_modules/.prisma

# 2. Reinstall dependencies (this will run postinstall: prisma generate)
npm install

# 3. Explicitly generate Prisma client (if postinstall didn't run)
npx prisma generate

# 4. Verify Prisma client exists
ls node_modules/.prisma/client

# 5. Push database schema (if needed)
npx prisma db push

# 6. Seed database (if needed)
npm run db:seed

# 7. Start dev server
npm run dev
```

## Verification Checklist

After running the fix commands, verify:

1. **Prisma client exists:**
   ```bash
   ls node_modules/.prisma/client
   ```
   Should show: `index.js`, `index.d.ts`, and other files

2. **Health endpoint works:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Should return JSON with `"prismaClient": "ok"`

3. **Availability endpoint works:**
   ```bash
   curl "http://localhost:3000/api/availability?unitSlug=the-white-house&from=2024-01-01&to=2024-12-31"
   ```
   Should return JSON (not HTML)

4. **Bookings endpoint works:**
   ```bash
   curl -X POST http://localhost:3000/api/bookings \
     -H "Content-Type: application/json" \
     -d '{"unitSlug":"the-white-house","name":"Test","email":"test@test.com","checkIn":"2024-06-01","checkOut":"2024-06-02","guests":"2"}'
   ```
   Should return JSON (not HTML 500)

## What Was Fixed

### 1. Package.json
- Added `"postinstall": "prisma generate"` - ensures Prisma client is generated after every `npm install`

### 2. Prisma Singleton (src/lib/prisma.ts)
- Added fail-fast check for Prisma client existence
- Improved error messages
- Better singleton pattern for dev hot reload

### 3. API Routes
- Added `export const runtime = 'nodejs'` to all routes using Prisma:
  - `/api/bookings`
  - `/api/availability`
  - `/api/admin/bookings`
  - `/api/admin/bookings/[id]/*`
  - `/api/admin/blocks`
  - `/api/admin/diagnostics`
  - `/api/health`

### 4. Health Endpoint
- Now checks Prisma client existence
- Returns `prismaClient: "ok" | "missing"` in response

### 5. Startup Check
- Verifies Prisma client exists before starting dev server
- Fails fast with clear error message

### 6. Client Error Handling
- BookingModal now properly handles HTML error responses
- Distinguishes between network errors and server errors (500)
- Shows appropriate error messages

## Prevention

The `postinstall` script ensures Prisma client is generated automatically after:
- `npm install`
- `npm ci`
- Fresh clone of repository

If you still see issues:
1. Run `npm run db:generate` manually
2. Check `node_modules/.prisma/client` exists
3. Restart dev server

## Files Changed

- `package.json` - Added postinstall script
- `src/lib/prisma.ts` - Added fail-fast check, improved singleton
- `src/app/api/**/route.ts` - Added `export const runtime = 'nodejs'` (12 files)
- `src/app/api/health/route.ts` - Added Prisma client check
- `scripts/startup-check.js` - Added Prisma client verification
- `src/components/BookingModal.tsx` - Improved error handling for HTML responses

## Quick Reference

```bash
# Generate Prisma client
npm run db:generate
# or
npx prisma generate

# Full clean rebuild
rm -rf .next node_modules node_modules/.prisma && npm install

# Verify client exists
ls node_modules/.prisma/client
```

