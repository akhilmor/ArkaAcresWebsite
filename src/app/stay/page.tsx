'use client'

// DO NOT render raw content blocks; use components only.
// This page must use Container, SectionHeading, and Card components for consistent layout.

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ErrorBoundary from '@/components/ErrorBoundary'
import HeroSection from '@/components/sections/HeroSection'
import StayUnitsSection from '@/components/sections/StayUnitsSection'
import HowBookingWorksSection from '@/components/sections/HowBookingWorksSection'
import FAQSection from '@/components/sections/FAQSection'
import ContactSection from '@/components/sections/ContactSection'
import Container from '@/components/Container'
import { useBookingModal } from '@/hooks/useBookingModal'
import { STAY_UNITS, IMAGES } from '@/content/siteContent'
import type { Section } from '@/content/types'

// Dev-only: Assert all imports are defined
if (process.env.NODE_ENV !== 'production') {
  if (!HeroSection) throw new Error('HeroSection import is undefined')
  if (!StayUnitsSection) throw new Error('StayUnitsSection import is undefined')
  if (!HowBookingWorksSection) throw new Error('HowBookingWorksSection import is undefined')
  if (!FAQSection) throw new Error('FAQSection import is undefined')
  if (!ContactSection) throw new Error('ContactSection import is undefined')
  if (!Container) throw new Error('Container import is undefined')
}

// Separate component for search params handling
function StayPageContent() {
  const { openBooking } = useBookingModal()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for booking query parameter (for deep links from detail page)
    const bookSlug = searchParams.get('book')
    if (bookSlug && STAY_UNITS.find((u) => u.slug === bookSlug)) {
      try {
        openBooking(bookSlug)
        // Clean up URL
        if (window.history.replaceState) {
          const url = new URL(window.location.href)
          url.searchParams.delete('book')
          window.history.replaceState({}, '', url.toString())
        }
      } catch (error) {
        console.error('[StayPageContent] Error opening booking from URL', { bookSlug, error })
      }
    }
  }, [searchParams, openBooking])

  // Guardrail: Ensure openBooking is a function
  const handleBookClick = (slug: string) => {
    try {
      if (typeof openBooking !== 'function') {
        throw new Error('openBooking is not a function. BookingProvider may not be mounted.')
      }
      openBooking(slug)
    } catch (error) {
      console.error('[StayPageContent] Error in handleBookClick', { slug, error })
      if (process.env.NODE_ENV !== 'production') {
        alert(`Booking error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  // Hero section config
  const heroSection: Section = {
    type: 'hero',
    heading: 'Stay at Arka Acres',
    subheading: 'Choose a stay that fits your pace—or book Aurora Grand for your next gathering.',
    primaryCta: { label: 'View Stays', href: '#stays' },
    imageLabel: IMAGES.pages.stay.hero.alt,
    imageSrc: IMAGES.pages.stay.hero.src,
    imagePosition: 'right',
  }

  // FAQ section config
  const faqSection: Section = {
    type: 'faq',
    heading: 'Stay & Event Questions',
    items: [
      {
        q: 'What is included in a stay?',
        a: 'All stays include access to the farm, basic amenities, and the peaceful surroundings. Specific amenities vary by unit—check each listing for details.',
      },
      {
        q: 'Can I book Aurora Grand for an event?',
        a: 'Yes! Aurora Grand is perfect for gatherings, celebrations, and community events. Use the booking form to specify your event type and requirements.',
      },
      {
        q: 'What is the cancellation policy?',
        a: 'Contact us directly for cancellation policies. We work with guests to accommodate changes when possible.',
      },
      {
        q: 'Are pets allowed?',
        a: 'Please contact us to discuss pet policies. We want to ensure a comfortable stay for all guests and our farm animals.',
      },
    ],
  }

  // Contact section config
  const contactSection: Section = {
    type: 'contact',
    heading: 'Contact Us',
    description: 'Have questions about your stay? Want to learn more? We\'d love to hear from you.',
    showForm: true,
  }

  return (
    <>
      {/* Hero Section */}
      <ErrorBoundary componentName="HeroSection">
        <HeroSection section={heroSection} />
      </ErrorBoundary>

      {/* Units Section */}
      <div id="stays" />
      <ErrorBoundary componentName="StayUnitsSection">
        <StayUnitsSection onBookClick={handleBookClick} />
      </ErrorBoundary>

      {/* How Booking Works */}
      <ErrorBoundary componentName="HowBookingWorksSection">
        <HowBookingWorksSection />
      </ErrorBoundary>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <Container maxWidth="6xl">
          <ErrorBoundary componentName="FAQSection">
            <FAQSection section={faqSection} />
          </ErrorBoundary>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-neutral-50">
        <Container maxWidth="6xl">
          <ErrorBoundary componentName="ContactSection">
            <ContactSection section={contactSection} />
          </ErrorBoundary>
        </Container>
      </section>
    </>
  )
}

export default function StayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <StayPageContent />
    </Suspense>
  )
}
