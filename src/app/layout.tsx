import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AnnouncementsBanner from '@/components/AnnouncementsBanner'
import BookingProvider from '@/components/BookingProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { SITE_CONFIG } from '@/content/siteContent'

// Dev-only: Assert critical imports
if (process.env.NODE_ENV !== 'production') {
  if (!Header) throw new Error('Header import is undefined')
  if (!Footer) throw new Error('Footer import is undefined')
  if (!BookingProvider) throw new Error('BookingProvider import is undefined')
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.tagline,
    type: 'website',
    url: SITE_CONFIG.url,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <ErrorBoundary componentName="RootLayout">
          <BookingProvider>
            <ErrorBoundary componentName="AnnouncementsBanner">
              <AnnouncementsBanner />
            </ErrorBoundary>
            <ErrorBoundary componentName="Header">
              <Header />
            </ErrorBoundary>
            <main className="min-h-screen pt-16 overflow-x-hidden">
              <ErrorBoundary componentName="PageContent">
                {children}
              </ErrorBoundary>
            </main>
            <ErrorBoundary componentName="Footer">
              <Footer />
            </ErrorBoundary>
          </BookingProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

