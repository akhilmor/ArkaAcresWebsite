# Admin Auth Fix - Root Cause & Solution

## Root Cause

**The bug:** `ensureAdminUser()` was overwriting the password hash on every login attempt.

**What happened:**
1. User resets password → DB gets new bcrypt hash ✅
2. User tries to login → `ensureAdminUser()` runs
3. `ensureAdminUser()` compares env `ADMIN_PASSWORD` with DB hash
4. They don't match (env still has old password) → **OVERWRITES DB with env password hash** ❌
5. Login fails because reset password was overwritten

**The fix:**
- Removed password update logic from `ensureAdminUser()` 
- Now it ONLY creates admin user if missing, NEVER updates existing password
- This prevents overwriting passwords set via reset flow

## Files Changed

1. **src/lib/adminConstants.ts** (NEW)
   - Added `ADMIN_EMAIL = 'arkaacres@gmail.com'` constant

2. **src/lib/ensureAdminUser.ts**
   - Removed password update logic (lines 38-51)
   - Now only creates if mver updates
   - Uses `ADMIN_EMAIL` constant

3. **src/app/api/admin/login/route.ts**
   - Enforces `ADMIN_EMAIL` - rejects any other email
   - Trims password input
   - Uses DB password hash (not env var)
   - Generic error messages ("Invalid credentials")

4. **src/app/api/admin/reset-password/route.ts**
   - Enforces `ADMIN_EMAIL` in query (finds by email + token)
   - Trims password before hashing
   - Adds verification test after reset (dev only)
   - Updates same DB field that login reads from

5. **src/app/api/admin/forgot-password/route.ts**
   - Enforces `ADMIN_EMAIL` constant
   - Normalizes email (lowercase, trim)
   - Only sends reset for `ADMIN_EMAIL`

6. **src/app/api/admin/change-password/route.ts**
   - Updated to use DB instead of .env file
   - Verifies against DB password hash
   - Updates DB password hash
   - Adds verification test (dev only)

7. **src/app/admin/reset-password/page.tsx**
   - Trims passwords before sending

8. **src/app/admin/forgot-password/page.tsx**
   - Normalizes email (lowercase, trim) before sending

## How to Test

### 1. Request Reset
- Go to `/admin`
- Click "Forgot password?"
- Enter: `arkaacres@gmail.com`
- Submit
- Should see reset link (on-screen in dev if email not configured)

### 2. Reset Password
- Open reset link from step 1
- Enter new password (min 10 chars): `TestPassword123`
- Confirm password
- Submit
- Should see "Password reset successfully"

### 3. Login with New Password
- Go to `/admin`
- Enter password: `TestPassword123`
- Should successfully log in ✅

### 4. Test Email Enforcement
- Go to `/admin/forgot-password`
- Enter: `wrong@email.com`
- Submit
- Should show success (no enumeration) but no reset link sent
- Try login with wrong email → should reject with "Invalid credentials"

### 5. Verify Password Persists
- After reset, try logging in multiple times
- Password should work consistently (not get overwritten)

## Security Features

✅ Only `arkaacres@gmail.com` can be admin
✅ Passwords trimmed consistently
✅ Emails lowercased a
✅ Generic error messages (no enumeration)
✅ Password hash verification after reset (dev only)
✅ Reset updates same DB field login reads from
