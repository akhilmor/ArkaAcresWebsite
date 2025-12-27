# Notification System - Setup & Testing Guide

## ✅ Implementation Complete

The notification system is now fully functional with:
- ✅ Email provider selection (Resend → SMTP fallback)
- ✅ Truthful diagnostics (shows both providers)
- ✅ Server logging (last 200 entries)
- ✅ NotificationLog table entries
- ✅ Booking status tracking
- ✅ Admin resend capability
- ✅ Accurate UI messaging

## Environment Variables

### Required
```bash
DATABASE_URL=file:./dev.db
ADMIN_PASSWORD=your-secure-password
```

### Email Provider (Choose ONE)

**Option 1: Resend (Recommended)**
```bash
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=bookings@arkaacres.org
```

**Option 2: SMTP Fallback**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Arka Acres <arkaacres@gmail.com>
```

**Note:** If both are configured, Resend is tried first, then SMTP fallback.

### SMS Provider (Optional)
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
```

### Owner Contact (Defaults Provided)
```bash
OWNER_EMAIL=arkaacres@gmail.com
OWNER_PHONE=+14695369020
```

### Optional
```bash
ENABLE_GUEST_SMS=false
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Testing Email Delivery

### 1. With SMTP Only (No Resend Key)

**Setup:**
```bash
# In .env.local, set ONLY SMTP vars (no RESEND_API_KEY)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Arka Acres <arkaacres@gmail.com>
```

**Verify:**
1. Visit `/api/health` - should show:
   - `emailProvider: "smtp"`
   - `smtpConfigured: true`
   - `resendConfigured: false`

2. Make a booking at `/stay`
3. Check `/admin` - should show:
   - `ownerEmailStatus: "sent"`
   - `guestEmailStatus: "sent"`
   - NotificationLog entries with `provider: "smtp"`

4. Check email inboxes:
   - Owner email to `OWNER_EMAIL`
   - Guest receipt to booking email

### 2. With Resend

**Setup:**
```bash
RESEND_API_KEY=re_your_key
EMAIL_FROM=bookings@arkaacres.org
```

**Verify:**
1. `/api/health` shows `emailProvider: "resend"`
2. Bookings send via Resend
3. NotificationLog shows `provider: "resend"`

### 3. No Email Provider

**Setup:**
```bash
# Remove both RESEND_API_KEY and SMTP vars
```

**Verify:**
1. `/api/health` shows `emailProvider: "none"`
2. Booking succeeds but notifications fail
3. UI shows: "Request saved. Email system not configured yet."
4. Admin shows `ownerEmailStatus: "failed"` with error `NO_EMAIL_PROVIDER_CONFIGURED`

## Testing SMS

### With Twilio Configured

1. `/api/health` shows `twilioConfigured: true`
2. Booking sends SMS to `OWNER_PHONE`
3. Admin shows `ownerSmsStatus: "sent"`

### Without Twilio

1. `/api/health` shows `twilioConfigured: false`
2. Booking succeeds, SMS fails
3. Admin shows `ownerSmsStatus: "failed"` with error `TWILIO_NOT_CONFIGURED`
4. No warnings shown to user (SMS is optional)

## Viewing Logs & Statuses

### Server Logs
- Visit `/admin/diagnostics`
- Scroll to "Server Logs (Last 200)"
- Shows all `serverLogBuffer` entries with timestamps

### Notification Logs
- Visit `/admin/diagnostics`
- Scroll to "Notification Logs (Last 50)"
- Shows all NotificationLog table entries with:
  - Booking ID
  - Audience (owner/guest)
  - Channel (email/sms)
  - Status (sent/failed)
  - Provider (resend/smtp/twilio)
  - Provider Message ID
  - Error message (if failed)

### Booking Statuses
- Visit `/admin` → Bookings table
- See per-channel statuses:
  - Owner Email: sent/failed/not_sent
  - Owner SMS: sent/failed/not_sent
  - Guest Email: sent/failed/not_sent
- Click resend buttons to retry

## Admin Resend

1. Visit `/admin`
2. Find booking in table
3. Click resend button (Mail icon for email, MessageSquare for SMS)
4. System will:
   - Force resend (bypass idempotency)
   - Create new NotificationLog entry
   - Update booking status fields
   - Log to serverLogBuffer

## Diagnostics Truthfulness

The `/api/health` endpoint now shows:
- `emailProvider`: `"resend"` | `"smtp"` | `"none"`
- `resendConfigured`: boolean
- `smtpConfigured`: boolean
- `twilioConfigured`: boolean

**No more "configured but not actually configured"** - diagnostics match reality.

## Common Issues

### "NO_EMAIL_PROVIDER_CONFIGURED"
- **Cause:** Neither Resend nor SMTP is configured
- **Fix:** Set either `RESEND_API_KEY` or `SMTP_HOST` + `SMTP_USER` + `SMTP_PASS`

### "SMTP send failed"
- **Cause:** SMTP credentials incorrect or server unreachable
- **Fix:** Verify `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` are correct
- **For Gmail:** Use App Password, not regular password

### "TWILIO_NOT_CONFIGURED"
- **Cause:** Twilio env vars missing
- **Note:** This is OK - SMS is optional. Bookings still work.

### Server Logs Empty
- **Cause:** No events logged yet
- **Fix:** Make a booking or trigger any notification - logs will populate

## Verification Checklist

After setup, verify:

- [ ] `/api/health` shows correct provider status
- [ ] Booking creates NotificationLog entries
- [ ] Booking updates status fields (`ownerEmailStatus`, etc.)
- [ ] Owner receives email at `OWNER_EMAIL`
- [ ] Guest receives receipt email
- [ ] Admin shows accurate statuses
- [ ] Admin resend buttons work
- [ ] Server logs populate in `/admin/diagnostics`
- [ ] UI shows correct messages (sent vs. not configured)

## Production Deployment

1. Set all required env vars in production environment
2. Verify `/api/health` shows providers configured
3. Test booking flow end-to-end
4. Monitor `/admin/diagnostics` for any failures
5. Use admin resend if needed

---

**Last Updated:** After notification system refactor
**Status:** ✅ Production Ready

