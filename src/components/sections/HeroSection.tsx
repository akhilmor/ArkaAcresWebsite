'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SmartImage from '@/components/SmartImage'
import VisitRequestModal from '@/components/VisitRequestModal'
import Container from '@/components/Container'
import { SITE_CONFIG } from '@/content/siteContent'
import type { HeroSection as HeroSectionType } from '@/content/types'

interface HeroSectionProps {
  section: HeroSectionType
}

export default function HeroSection({ section }: HeroSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const imagePosition = section.imagePosition || 'right'
  const hasImage = !!(section.imageSrc || section.imageLabel)

  const handleCTAClick = (cta: typeof section.primaryCta | typeof section.secondaryCta, e: React.MouseEvent) => {
    if (!cta) return
    
    const isBookVisit = cta.label.toLowerCase().includes('book a visit')
    const shouldUseModal = isBookVisit && (cta.href === '#' || cta.href === '#visit-modal')
    
    if (shouldUseModal && !cta.external && (!SITE_CONFIG.visitBookingUrl || SITE_CONFIG.visitBookingUrl === '#')) {
      e.preventDefault()
      setIsModalOpen(true)
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-sage-100 via-earth-50 to-neutral-100 py-20 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sage-500 rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10">
        {hasImage ? (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto`}>
            {/* Content */}
            <div className={imagePosition === 'right' ? 'order-1' : 'order-2'}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-earth-800 font-bold mb-4 sm:mb-6 leading-tight">
                {section.heading}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-neutral-700 mb-3 sm:mb-4 font-medium">
                {section.subheading}
              </p>
              {section.supportingText && (
                <p className="text-base sm:text-lg text-neutral-600 mb-6 sm:mb-8 max-w-prose">
                  {section.supportingText}
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {(() => {
                  const isBookVisit = section.primaryCta.label.toLowerCase().includes('book a visit')
                  const shouldUseModal = isBookVisit && (section.primaryCta.href === '#' || section.primaryCta.href === '#visit-modal')
                  const useExternalUrl = isBookVisit && SITE_CONFIG.visitBookingUrl && SITE_CONFIG.visitBookingUrl !== '#'
                  
                  if (section.primaryCta.external || useExternalUrl) {
                    const href = useExternalUrl ? SITE_CONFIG.visitBookingUrl : section.primaryCta.href
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl min-h-[44px]"
                      >
                        {section.primaryCta.label}
                        <ArrowRight size={20} />
                      </a>
                    )
                  }
                  
                  if (shouldUseModal) {
                    return (
                      <button
                        type="button"
                        onClick={(e) => handleCTAClick(section.primaryCta, e)}
                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl min-h-[44px]"
                      >
                        {section.primaryCta.label}
                        <ArrowRight size={20} />
                      </button>
                    )
                  }
                  
                  return (
                    <Link
                      href={section.primaryCta.href}
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl min-h-[44px]"
                    >
                      {section.primaryCta.label}
                      <ArrowRight size={20} />
                    </Link>
                  )
                })()}

                {section.secondaryCta && (() => {
                  const isBookVisit = section.secondaryCta.label.toLowerCase().includes('book a visit')
                  const shouldUseModal = isBookVisit && (section.secondaryCta.href === '#' || section.secondaryCta.href === '#visit-modal')
                  const useExternalUrl = isBookVisit && SITE_CONFIG.visitBookingUrl && SITE_CONFIG.visitBookingUrl !== '#'
                  
                  if (section.secondaryCta.external || useExternalUrl) {
                    const href = useExternalUrl ? SITE_CONFIG.visitBookingUrl : section.secondaryCta.href
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-earth-800 bg-white border-2 border-earth-300 rounded-lg hover:bg-earth-50 transition-all min-h-[44px]"
                      >
                        {section.secondaryCta.label}
                      </a>
                    )
                  }
                  
                  if (shouldUseModal) {
                    return (
                      <button
                        type="button"
                        onClick={(e) => handleCTAClick(section.secondaryCta!, e)}
                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-earth-800 bg-white border-2 border-earth-300 rounded-lg hover:bg-earth-50 transition-all min-h-[44px]"
                      >
                        {section.secondaryCta.label}
                      </button>
                    )
                  }
                  
                  return (
                    <Link
                      href={section.secondaryCta.href}
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-earth-800 bg-white border-2 border-earth-300 rounded-lg hover:bg-earth-50 transition-all min-h-[44px]"
                    >
                      {section.secondaryCta.label}
                    </Link>
                  )
                })()}
              </div>
            </div>

            {/* Image */}
            <div className={imagePosition === 'right' ? 'order-2' : 'order-1'}>
              <SmartImage
                src={section.imageSrc}
                alt={section.imageLabel || 'Hero image'}
                aspectRatio="wide"
                priority
                fallbackLabel={section.imageLabel}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-earth-800 font-bold mb-4 sm:mb-6 leading-tight">
              {section.heading}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-neutral-700 mb-3 sm:mb-4 font-medium">
              {section.subheading}
            </p>
            {section.supportingText && (
              <p className="text-base sm:text-lg text-neutral-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                {section.supportingText}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              {section.primaryCta.external ? (
                <a
                  href={section.primaryCta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl min-h-[44px] w-full sm:w-auto"
                >
                  {section.primaryCta.label}
                  <ArrowRight size={20} />
                </a>
              ) : (
                <Link
                  href={section.primaryCta.href}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl min-h-[44px] w-full sm:w-auto"
                >
                  {section.primaryCta.label}
                  <ArrowRight size={20} />
                </Link>
              )}

              {section.secondaryCta && (
                <>
                  {section.secondaryCta.external ? (
                    <a
                      href={section.secondaryCta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-earth-800 bg-white border-2 border-earth-300 rounded-lg hover:bg-earth-50 transition-all min-h-[44px] w-full sm:w-auto"
                    >
                      {section.secondaryCta.label}
                    </a>
                  ) : (
                    <Link
                      href={section.secondaryCta.href}
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-earth-800 bg-white border-2 border-earth-300 rounded-lg hover:bg-earth-50 transition-all min-h-[44px] w-full sm:w-auto"
                    >
                      {section.secondaryCta.label}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Container>
      <VisitRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  )
}
