# Booking System Setup Guide

## Overview

The Arka Acres booking system is a full-featured Airbnb-style booking tool with:
- Availability calendar per unit
- Database-backed bookings with overlap prevention
- Admin panel for managing bookings and blocking dates
- Automatic email and SMS notifications

## Database Setup

The system uses Prisma with SQLite (dev) and can be easily switched to Postgres.

### Initial Setup

1. **Database is already created and seeded** with 3 units:
   - The White House (stay, sleeps 15)
   - Red Roost (stay, sleeps 2)
   - Aurora Grand (event hall)

2. **To reset the database:**
   ```bash
   rm prisma/dev.db
   npm run db:migrate
   npm run db:seed
   ```

3. **To switch to Postgres:**
   - Update `prisma/schema.prisma` datasource to `postgresql`
   - Update `DATABASE_URL` in `.env.local` to your Postgres connection string
   - Run `npm run db:migrate`

## Environment Variables

Add these to `.env.local`:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="Arka Acres <bookings@arkaacres.org>"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_FROM_NUMBER="+1234567890"
SMS_TO_NUMBER="+14695369020"

# Admin
ADMIN_PASSWORD="your-secure-password-here"
```

## Features

### Booking Flow

1. **User selects unit** on `/stay` page
2. **Clicks "Book Now"** → Opens booking modal
3. **Selects dates** on availability calendar (disabled dates shown)
4. **Fills form** (name, email, phone, guests, etc.)
5. **Submits** → Server validates and checks availability
6. **If available:**
   - Booking created in database (status: "pending")
   - Email sent to `arkaacres@gmail.com`
   - SMS sent to `+14695369020`
   - Success message shown to user
7. **If unavailable:**
   - Error message shown
   - User must select different dates

### Availability Logic

- **Stay units:** Blocks check-in through check-out (exclusive)
- **Event units:** Blocks the entire event date
- **Overlap prevention:** Server-side validation prevents double bookings
- **Blocked dates:** Admin can block dates for maintenance/personal use

### Admin Panel

Access at `/admin` (password-protected)

**Features:**
- View all bookings (filter by unit, status)
- Confirm/cancel bookings
- Create blocked date ranges
- Delete blocked dates

**Login:**
- Password set via `ADMIN_PASSWORD` env var
- Session stored in httpOnly cookie (7 days)

## API Routes

### Public

- `GET /api/availability?unitSlug=...&from=...&to=...` - Get disabled dates
- `POST /api/bookings` - Create booking request

### Admin (Protected)

- `POST /api/admin/login` - Login
- `GET /api/admin/check` - Check auth status
- `POST /api/admin/logout` - Logout
- `GET /api/admin/bookings` - List all bookings
- `POST /api/admin/bookings/[id]/status` - Update booking status
- `GET /api/admin/blocks` - List blocked dates
- `POST /api/admin/blocks` - Create blocked date range
- `DELETE /api/admin/blocks/[id]` - Delete blocked date range

## Security

- **Rate limiting:** 3 requests per minute per IP
- **Honeypot field:** Prevents bot submissions
- **Server-side validation:** All checks done on server
- **Admin auth:** Password-protected with httpOnly cookies

## Testing

1. **Test booking flow:**
   - Go to `/stay`
   - Click "Book Now" on any unit
   - Select dates (past dates should be disabled)
   - Fill form and submit
   - Check email/SMS received

2. **Test admin panel:**
   - Go to `/admin`
   - Login with `ADMIN_PASSWORD`
   - View bookings
   - Confirm/cancel a booking
   - Create a blocked date range
   - Try booking that date (should be disabled)

3. **Test overlap prevention:**
   - Create a booking for specific dates
   - Try to create another booking for overlapping dates
   - Should show error: "Selected dates are not available"

## Troubleshooting

**Calendar not showing:**
- Check browser console for errors
- Ensure `react-day-picker` CSS is imported (should be in `BookingCalendar.tsx`)

**Bookings not saving:**
- Check database file exists: `prisma/dev.db`
- Check `DATABASE_URL` in `.env.local`
- Check server logs for Prisma errors

**Email/SMS not sending:**
- Check env vars are set correctly
- Check Resend/Twilio API keys are valid
- Check server logs for error messages
- Note: Bookings still save even if email/SMS fails

**Admin login not working:**
- Check `ADMIN_PASSWORD` is set in `.env.local`
- Clear cookies and try again
- Check server logs for errors

