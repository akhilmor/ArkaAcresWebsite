'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Container from '@/components/Container'
import type { CTABandSection as CTABandSectionType } from '@/content/types'
import { SITE_CONFIG } from '@/content/siteContent'
import VisitRequestModal from '@/components/VisitRequestModal'

interface CTABandSectionProps {
  section: CTABandSectionType
}

export default function CTABandSection({ section }: CTABandSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isPrimary = section.variant !== 'secondary'

  const handleButtonClick = (button: typeof section.buttons[0], e: React.MouseEvent) => {
    // Check if this is a "Book a Visit" button that should open modal
    const isBookVisit = button.label.toLowerCase().includes('book a visit')
    const shouldUseModal = isBookVisit && (button.href === '#' || button.href === '#visit-modal')
    
    if (shouldUseModal && !button.external && (!SITE_CONFIG.visitBookingUrl || SITE_CONFIG.visitBookingUrl === '#')) {
      e.preventDefault()
      setIsModalOpen(true)
      return
    }
    
    // If VISIT_BOOKING_URL is set and valid, let it open normally
    if (isBookVisit && SITE_CONFIG.visitBookingUrl && SITE_CONFIG.visitBookingUrl !== '#') {
      // Will open external link normally
      return
    }
  }

  return (
    <>
      <section className={`section-wrapper ${isPrimary ? 'bg-gradient-to-br from-primary to-primary-dark' : 'bg-neutral-900'}`}>
        <Container maxWidth="4xl">
          <div className="text-center">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-3 sm:mb-4 ${isPrimary ? 'text-white' : 'text-white'}`}>
              {section.heading}
            </h2>
            {section.body && (
              <p className={`text-base sm:text-lg mb-6 sm:mb-8 ${isPrimary ? 'text-white/90' : 'text-neutral-300'}`}>
                {section.body}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              {section.buttons.map((button, index) => {
                const isPrimaryButton = button.variant !== 'secondary'
                const buttonClass = isPrimaryButton
                  ? 'bg-white text-primary hover:bg-neutral-100'
                  : 'bg-transparent border-2 border-white text-white hover:bg-white/10'

                const isBookVisit = button.label.toLowerCase().includes('book a visit')
                const shouldUseModal = isBookVisit && (button.href === '#' || button.href === '#visit-modal')
                const useExternalUrl = isBookVisit && SITE_CONFIG.visitBookingUrl && SITE_CONFIG.visitBookingUrl !== '#'

                if (button.external || useExternalUrl) {
                  const href = useExternalUrl ? SITE_CONFIG.visitBookingUrl : button.href
                  return (
                    <a
                      key={index}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl min-h-[44px] w-full sm:w-auto ${buttonClass}`}
                    >
                      {button.label}
                      <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                    </a>
                  )
                }

                if (shouldUseModal) {
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => handleButtonClick(button, e)}
                      className={`inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl min-h-[44px] w-full sm:w-auto ${buttonClass}`}
                    >
                      {button.label}
                      <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  )
                }

                return (
                  <Link
                    key={index}
                    href={button.href}
                    className={`inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl min-h-[44px] w-full sm:w-auto ${buttonClass}`}
                  >
                    {button.label}
                    <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                  </Link>
                )
              })}
            </div>
          </div>
        </Container>
      </section>
      <VisitRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

