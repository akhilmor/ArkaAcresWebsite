# Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   cd nextjs
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Note on Linter Errors

The TypeScript/linter errors you may see in your IDE are **expected** until you run `npm install`. These errors occur because:

- Type definitions for Next.js, React, and other packages aren't available until dependencies are installed
- The project structure is correct and will work once dependencies are installed

After running `npm install`, all errors should resolve.

## Next Steps

1. Update configuration in `src/content/siteContent.ts`:
   - `SITE_CONFIG.bookingUrl` - Your booking system URL
   - `SITE_CONFIG.donateUrl` - Your donation link
   - `SITE_CONFIG.contactEmail` - Your contact email
   - `SITE_CONFIG.url` - Your domain

2. Customize content by editing `src/content/siteContent.ts`

3. Deploy to Vercel (recommended) or your preferred hosting platform

## Project Structure

- All content is in `src/content/siteContent.ts` - edit here to update copy
- Components are in `src/components/` - reusable UI elements
- Pages are in `src/app/` - Next.js App Router pages
- Styling uses TailwindCSS with custom colors (burnt orange primary, sage/earth neutrals)

