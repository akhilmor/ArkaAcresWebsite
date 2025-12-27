# Testing the Arka Acres Website

## Quick Start

1. **Start the development server:**
   ```bash
   cd nextjs
   npm run dev
   ```

2. **Open your browser:**
   - Go to: `http://localhost:3000`
   - The site should load on your local machine

## Testing Different Pages

### Home Page
- URL: `http://localhost:3000/`
- Test: Navigation, hero section, all links work

### Activities
- URL: `http://localhost:3000/activities`
- Test: Category cards, links to subpages

### Activities Subpages
- `http://localhost:3000/activities/experiences`
- `http://localhost:3000/activities/learn`
- `http://localhost:3000/activities/yoga`
- `http://localhost:3000/activities/summer-camps`

### Farming
- URL: `http://localhost:3000/farming`
- Test: Content sections, links

### Stay
- URL: `http://localhost:3000/stay`
- Test: 
  - View stay units (The White House, Red Roost)
  - View event unit (Aurora Grand)
  - Click "Book Now" to test booking modal

### Stay Detail Pages
- `http://localhost:3000/stay/the-white-house`
- `http://localhost:3000/stay/aurora-grand`
- `http://localhost:3000/stay/red-roost`

### Bookings Page
- URL: `http://localhost:3000/bookings`
- Test: View bookings stored in localStorage

## Testing Booking System

### Without Email/SMS Setup (Testing UI Only)

1. Go to `/stay` page
2. Click "Book Now" on any unit
3. Fill out the booking form
4. Submit - you'll see an error (expected, since API keys aren't set)
5. The form should show error handling

### With Email/SMS Setup

1. Create `.env.local` file in `nextjs/` directory:
   ```env
   RESEND_API_KEY=your_resend_key
   EMAIL_FROM=onboarding@resend.dev
   EMAIL_TO=arkaacres@gmail.com
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_FROM_NUMBER=+1234567890
   SMS_TO_NUMBER=+14695369020
   ```

2. Restart the dev server after adding env vars
3. Submit a booking - should send email and SMS

## Testing Responsiveness

Open browser DevTools (F12) and test these viewport sizes:
- **Mobile:** 375px (iPhone)
- **Tablet:** 768px (iPad)
- **Desktop:** 1024px, 1440px, 1920px

Check:
- Navigation menu (hamburger on mobile)
- Cards reflow correctly
- Images scale properly
- No horizontal scrolling
- Text is readable

## Testing Navigation

1. **Desktop Nav:** Should show 5 items (Home, Goshala, Activities, Farming, Stay)
2. **Mobile Nav:** Click hamburger menu, should show same 5 items
3. **Goshala Link:** Should open `https://www.arkagoshala.org/` in new tab
4. **Footer:** Should show same navigation links

## Common Issues

### Port Already in Use
If port 3000 is busy:
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Build Errors
If you see build errors:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try again
npm run dev
```

### API Routes Not Working
- Make sure `.env.local` exists with required variables
- Check that Resend and Twilio credentials are valid
- API routes will fail gracefully if credentials are missing (shows error to user)

## Testing Checklist

- [ ] Home page loads
- [ ] All navigation links work
- [ ] Mobile menu works
- [ ] Booking modal opens and closes
- [ ] Contact form works
- [ ] Images load (or show placeholders)
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Footer links work
- [ ] Goshala opens in new tab

## Viewing Bookings

After submitting bookings:
1. Go to `/bookings` page
2. You should see all bookings stored in localStorage
3. Can delete bookings from this page
4. Can reply via email or call

**Note:** Bookings are stored in browser localStorage, so they're only visible on the same browser/device where they were submitted.

