# Vercel Environment Variables Checklist

## Required for Production Deployment

Add these environment variables in **Vercel Dashboard → Your Project → Settings → Environment Variables**.

### 🔴 CRITICAL - Must Set

1. **DATABASE_URL**
   - **Value:** PostgreSQL connection string
   - **Example:** `postgresql://user:password@host:5432/dbname?sslmode=require`
   - **Note:** If using Vercel Postgres, this is auto-provided. Otherwise, get from your database provider (Supabase, Railway, Neon, etc.)

2. **ADMIN_EMAIL**
   - **Value:** Your admin email address
   - **Example:** `admin@arkaacres.com`
   - **Note:** Used for password reset functionality

3. **ADMIN_PASSWORD**
   - **Value:** Your secure admin password
   - **Example:** `YourSecurePassword123!`
   - **Note:** Initial password for `/admin` panel. Can be changed via reset flow.

4. **NEXT_PUBLIC_SITE_URL**
   - **Value:** Your production domain URL
   - **Example:** `https://arkaacres.com`
   - **Note:** Must include `https://`. Used for email links and password reset URLs.

5. **NEXT_PUBLIC_APP_URL**
   - **Value:** Same as NEXT_PUBLIC_SITE_URL (or can be different if needed)
   - **Example:** `https://arkaacres.com`
   - **Note:** Used specifically for password reset links.

### 📧 Email Provider (Choose ONE)

#### Option 1: Resend (Recommended)

6. **RESEND_API_KEY**
   - **Value:** Your Resend API key
   - **Example:** `re_xxxxxxxxxxxxx`
   - **Get from:** https://resend.com/api-keys

7. **EMAIL_FROM**
   - **Value:** Verified sender email in Resend
   - **Example:** `Arka Acres <bookings@arkaacres.com>`
   - **Note:** Domain must be verified in Resend dashboard

#### Option 2: SMTP (Gmail/Google Workspace)

6. **SMTP_HOST**
   - **Value:** `smtp.gmail.com` (for Gmail)
   - **Example:** `smtp.gmail.com`

7. **SMTP_PORT**
   - **Value:** `587` (for TLS) or `465` (for SSL)
   - **Example:** `587`

8. **SMTP_SECURE**
   - **Value:** `false` (for port 587) or `true` (for port 465)
   - **Example:** `false`

9. **SMTP_USER**
   - **Value:** Your Gmail address
   - **Example:** `arkaacres@gmail.com`

10. **SMTP_PASS**
    - **Value:** Google App Password (NOT your regular password)
    - **Example:** `peba otig lxhx vjsn`
    - **Note:** Generate from: Google Account → Security → 2-Step Verification → App Passwords

11. **EMAIL_FROM**
    - **Value:** Your email address
    - **Example:** `Arka Acres <arkaacres@gmail.com>`

### 📱 SMS Provider (Optional)

12. **TWILIO_ACCOUNT_SID**
    - **Value:** Your Twilio Account SID
    - **Example:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
    - **Get from:** https://console.twilio.com/

13. **TWILIO_AUTH_TOKEN**
    - **Value:** Your Twilio Auth Token
    - **Example:** `your_auth_token_here`
    - **Get from:** https://console.twilio.com/

14. **TWILIO_FROM_NUMBER**
    - **Value:** Your Twilio phone number (E.164 format)
    - **Example:** `+1234567890`
    - **Note:** Must start with `+`

15. **SMS_TO_NUMBER**
    - **Value:** Where to send booking notifications
    - **Example:** `+14695369020`
    - **Default:** `+14695369020` (can be omitted if this is your default)

### 👤 Owner Contact (Defaults Provided)

16. **OWNER_EMAIL**
    - **Value:** Email to receive booking notifications
    - **Example:** `arkaacres@gmail.com`
    - **Default:** `arkaacres@gmail.com` (can be omitted)

17. **OWNER_PHONE**
    - **Value:** Phone number for SMS notifications
    - **Example:** `+14695369020`
    - **Default:** `+14695369020` (can be omitted)

### ⚙️ Optional Features

18. **ENABLE_GUEST_SMS**
    - **Value:** `true` or `false`
    - **Example:** `false`
    - **Default:** `false` (can be omitted)
    - **Note:** Enables SMS receipts for guests (requires Twilio)

---

## Quick Setup Steps

1. **In Vercel Dashboard:**
   - Go to your project
   - Settings → Environment Variables
   - Click "Add New"

2. **For each variable:**
   - Enter the **Name** (exactly as shown above)
   - Enter the **Value**
   - Select **Environment(s):** Production (and Preview/Development if desired)
   - Click "Save"

3. **After adding all variables:**
   - Redeploy your project (or wait for next deployment)
   - Vercel will automatically use the new environment variables

4. **Verify:**
   - Visit `https://yourdomain.com/api/health`
   - Should show all providers configured correctly

---

## Important Notes

- **Never commit `.env` files** - All secrets should only be in Vercel dashboard
- **DATABASE_URL** - If using Vercel Postgres, Vercel provides this automatically
- **NEXT_PUBLIC_*** variables are exposed to the browser - don't put secrets here
- **Email Provider** - You must configure either Resend OR SMTP (not both required, but at least one)
- **SMS Provider** - Twilio is optional. Bookings work without it, but SMS notifications won't send.

---

## Troubleshooting

**Build fails with "DATABASE_URL missing":**
- Ensure DATABASE_URL is set in Vercel environment variables
- If using Vercel Postgres, it should be auto-provided
- Check that environment is set to "Production" (or all environments)

**Email/SMS not working:**
- Check `/api/health` endpoint to see which providers are configured
- Verify all required env vars are set correctly
- Check Resend/Twilio dashboards for delivery logs

**Password reset links broken:**
- Ensure `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL` are set to your production domain
- Must include `https://` protocol
- No trailing slash

