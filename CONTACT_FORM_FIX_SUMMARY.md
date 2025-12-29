# Contact Form & Page Implementation

## Files Created
1. **src/app/contact/page.tsx** (UPDATED)
   - Contact page with phone and email details
   - Includes contact form
   - "Back to Home" link
   - Friendly message about response time

## Files Modified
1. **src/app/api/contact/route.ts**
   - Updated to use existing email system (`sendEmail` from `@/lib/notifications/email`)
   - Now uses SMTP fallback if Resend is not configured
   - Sends HTML and text versions of email
   - Includes reply-to header (sender's email)
   - Sends to `OWNER_EMAIL` (defaults to arkaacres@gmail.com)
   - Optional SMS notification (doesn't fail if SMS fails)

2. **src/components/ContactForm.tsx**
   - Success message updated to "Message sent successfully!"
   - Error message updated to "Something went wrong. Please try again later."
   - Form already had proper loading state and field clearing

3. **src/content/siteContent.ts**
   - Contact added to NAV_ITEMS (already done in previous task)

4. **src/components/Footer.tsx**
   - Contact link updated to /contact (already done in previous task)

## API Route Location
**`/api/contact`** - `src/app/api/contact/route.ts`

This route:
- Accepts POST requests with `{ name, email, message, honey }`
- Validates input with Zod
- Checks honeypot field (spam protection)
- Rate limits (3 requests per minute per IP)
- Sends email using existing email system (Resend → SMTP fallback)
- Optionally sends SMS if Twilio is configured
- Returns `{ ok: true }` on success or `{ ok: false, error: "..." }` on failure

## Email System Integration
The contact form now uses the same email system as bookings:
- Tries Resend first (if `RESEND_API_KEY` is set)
- Falls back to SMTP (if `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` are set)
- Sends to `OWNER_EMAIL` (defaults to arkaacres@gmail.com)
- Includes HTML and plain text versions
- Sets reply-to to the sender's email

## Contact Page Features
- Heading:Contact Us"
- Subtitle: "Have questions about your stay or about the Goshala? Reach us directly."
- Phone: +1 (469) 536-9018 (tap-to-call link)
- Email: arkaacres@gmail.com (mailto link)
- Contact form embedded on page
- Friendly note: "We'll do our best to respond within 24 hours. Thank you for your patience and support for our Gomathas!"
- "Back to Home" link

## To Test Locally
1. Run: `npm run dev`
2. Visit: `http://localhost:3000/contact`
3. Fill out the contact form
4. Submit and verify:
   - Success message appears: "Message sent successfully!"
   - Form fields clear
   - Check email inbox (arkaacres@gmail.com) for the message
   - Check server logs for email sending status

## Email Configuration
The form will work if either:
- Resend is configured (`RESEND_API_KEY` + `EMAIL_FROM`)
- OR SMTP is configured (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)

If neither is configured, the form will return an error.
