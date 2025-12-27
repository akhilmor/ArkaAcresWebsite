# Booking System Setup

This document explains how to set up the booking system with email and SMS notifications.

## Overview

The booking system automatically sends:
- **Email** to `arkaacres@gmail.com` via Resend
- **SMS** to `+1 (469) 536-9020` via Twilio

When a user submits a booking or contact form, they receive an on-page success message without needing to open their email client.

## Environment Variables

Create a `.env.local` file in the `nextjs` directory with the following variables:

### Resend (Email)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. For testing, you can use `onboarding@resend.dev` as the `EMAIL_FROM`
4. For production, verify your domain and use a custom email address

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
EMAIL_TO=arkaacres@gmail.com
```

### Twilio (SMS)

1. Sign up at [twilio.com](https://twilio.com)
2. Get a phone number from Twilio
3. Get your Account SID and Auth Token from the dashboard

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
SMS_TO_NUMBER=+14695369020
```

## Testing Locally

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual API keys and credentials

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Test the booking form:
   - Go to `/stay`
   - Click "Book Now" on any unit
   - Fill out the form and submit
   - Check your email and SMS for notifications

## Security Features

The booking system includes:

- **Rate Limiting**: Max 3 requests per IP per minute
- **Honeypot Field**: Hidden field that bots might fill (rejected if filled)
- **Input Validation**: Server-side validation using Zod
- **Error Handling**: Graceful error messages for users

## API Routes

- `POST /api/booking` - Handles booking submissions
- `POST /api/contact` - Handles contact form submissions

Both routes:
- Validate input
- Check rate limits
- Verify honeypot field
- Send email via Resend
- Send SMS via Twilio
- Return JSON response

## Troubleshooting

### Email not sending
- Check that `RESEND_API_KEY` is set correctly
- Verify the `EMAIL_FROM` address is valid
- Check Resend dashboard for delivery status

### SMS not sending
- Check that all Twilio env vars are set
- Verify the `TWILIO_FROM_NUMBER` is a valid Twilio number
- Check Twilio console for error messages

### Rate limit errors
- Wait 1 minute between submissions
- Or clear the rate limit map (restart server)

## Production Deployment

1. Set all environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Verify your domain with Resend for production emails
3. Ensure Twilio phone number is active
4. Test the booking flow in production

## Notes

- Bookings are also stored in browser localStorage for viewing on `/bookings` page
- The system gracefully handles failures (if email fails but SMS succeeds, it still returns success)
- All form data is validated server-side before sending notifications

