'use client'

import { useState } from 'react'
import HouseCard from '@/components/HouseCard'
import Container from '@/components/Container'
import { STAY_UNITS, IMAGES } from '@/content/siteContent'

interface StayUnitsSectionProps {
  onBookClick: (slug: string) => void
}

export default function StayUnitsSection({ onBookClick }: StayUnitsSectionProps) {
  const [error, setError] = useState<string | null>(null)

  const handleBookClick = (slug: string) => {
    try {
      setError(null)
      if (typeof onBookClick !== 'function') {
        throw new Error('onBookClick is not a function')
      }
      onBookClick(slug)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('[StayUnitsSection] Error in handleBookClick', { slug, error: errorMessage, err })
      setError(`Booking UI error — check console.`)
    }
  }
  const stays = STAY_UNITS.filter((unit) => unit.type === 'stay')
  const events = STAY_UNITS.filter((unit) => unit.type === 'event')

  return (
    <>
      {/* Dev-only error banner */}
      {error && process.env.NODE_ENV !== 'production' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 sm:mx-6 lg:mx-8 mb-4">
          <p className="text-sm font-semibold text-red-800">⚠️ Booking UI error — check console.</p>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Stays */}
      {stays.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24 bg-white">
          <Container maxWidth="6xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-earth-800 font-bold mb-3 sm:mb-4">
                Stays
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
                Choose from our comfortable accommodations for your peaceful farm stay.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {stays.map((unit) => {
                const unitImage = IMAGES.units[unit.slug as keyof typeof IMAGES.units]
                return (
                  <HouseCard
                    key={unit.slug}
                    slug={unit.slug}
                    name={unit.name}
                    type={unit.type}
                    bedrooms={unit.bedrooms}
                    sleepsUpTo={unit.sleepsUpTo}
                    description={unit.description}
                    imageLabel={unit.imageLabel}
                    imageSrc={unitImage?.src}
                    amenities={[...unit.amenities]}
                    onBookClick={handleBookClick}
                  />
                )
              })}
            </div>
          </Container>
        </section>
      )}

      {/* Events */}
      {events.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24 bg-neutral-50">
          <Container maxWidth="6xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-earth-800 font-bold mb-3 sm:mb-4">
                Events
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
                Book Aurora Grand for your next gathering, celebration, or community event.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
              {events.map((unit) => {
                const unitImage = IMAGES.units[unit.slug as keyof typeof IMAGES.units]
                return (
                  <HouseCard
                    key={unit.slug}
                    slug={unit.slug}
                    name={unit.name}
                    type={unit.type}
                    bedrooms={unit.bedrooms}
                    sleepsUpTo={unit.sleepsUpTo}
                    description={unit.description}
                    imageLabel={unit.imageLabel}
                    imageSrc={unitImage?.src}
                    amenities={[...unit.amenities]}
                    onBookClick={handleBookClick}
                  />
                )
              })}
            </div>
          </Container>
        </section>
      )}
    </>
  )
}

