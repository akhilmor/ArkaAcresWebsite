# Admin Password Reset - Implementation Complete

## What Was Added

### 1. Database Schema
- Added `AdminUser` model to Prisma schema
- Fields: id, email (unique), passwordHash, resetTokenHash, resetTokenExpiresAt
- Run: `npx prisma db push` (already done)

### 2. Password Security
- Installed `bcryptjs` for password hashing
- Created `src/lib/adminAuth.ts` with:
  - `hashPassword()` - bcrypt with cost 12
  - `verifyPassword()` - password verification
  - `generateResetToken()` - secure token generation
  - `hashToken()` - SHA256 token hashing

### 3. Admin Bootstrap
- Created `src/lib/ensureAdminUser.ts`
- Automatically creates admin user from `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars
- Called on-demand when needed

### 4. API Routes
- `POST /api/admin/forgot-password` - Sends reset email
- `POST /api/admin/reset-password` - Resets password with token
- Updated `POST /api/admin/login` - Now uses DB instead of env var

### 5. UI Pages
- `/admin/forgot-password` - Request reset link
- `/admin/reset-password?token=...` - Reset password form
- Updated `/admin` login page with "Forgot password?" link

### 6. Email Integration
- Uses existing `sendEmail()` from `src/lib/notifications/email.ts`
- Supports Resend and SMTP fallback
- In dev mode, shows reset link on-screen if email fails

## Environment Variables

Add to your `.env` file:

```bash
# Admin email (defaults to OWNER_EMAIL if not set)
ADMIN_EMAIL=arkaacres@gmail.com

# App URL for reset links (defaults to NEXT_PUBLIC_SITE_URL or localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Commands to Run

```bash
# 1. Ensure Prisma client is generated
npx prisma generate

# 2. Push schema to database (if not already done)
npx prisma db push

# 3. Start dev server
npm run dev
```

## Testing Checklist

1. **Forgot Password (Dev Mode):**
   - Go to `/admin`
   - Click "Forgot password?"
   - Enter admin email (default: arkaacres@gmail.com)
   - Submit form
   - Should see reset link on-screen (if email not configured)
   - Copy the link

2. **Reset Password:**
   - Open reset link from step 1
   - Enter new password (min 10 characters)
   - Confirm password
   - Submit
   - Should redirect to login

3. **Login with New Password:**
   - Go to `/admin`
   - Enter new password
   - Should successfully log in

## Security Features

✅ Passwords hashed with bcrypt (cost 12)
✅ Reset tokens hashed with SHA256 in DB
✅ Tokens expire after 30 minutes
✅ No email enumeration (always returns ok:true)
✅ Tokens cleared after successful reset
✅ Minimum password length: 10 characters

## Files Changed

- `prisma/schema.prisma` - Added AdminUser model
- `src/lib/adminAuth.ts` - NEW: Password/token helpers
- `src/lib/ensureAdminUser.ts` - NEW: Admin bootstrap
- `src/lib/env.ts` - Added ADMIN_EMAIL, NEXT_PUBLIC_APP_URL
- `src/app/api/admin/login/route.ts` - Updated to use DB
- `src/app/api/admin/forgot-password/route.ts` - NEW
- `src/app/api/admin/reset-passwor- NEW
- `src/app/admin/page.tsx` - Added forgot password link
- `src/app/admin/forgot-password/page.tsx` - NEW
- `src/app/admin/reset-password/page.tsx` - NEW
- `package.json` - Added bcryptjs dependency
- `README.md` - Added dev troubleshooting section

## Notes

- Admin user is automatically created on first login attempt
- Email uses existing notification system (Resend/SMTP)
- In development, reset links are shown on-screen if email fails
- Old `ADMIN_PASSWORD` env var still works for initial bootstrap
