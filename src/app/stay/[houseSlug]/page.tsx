'use client'

import Link from 'next/link'
import { Calendar, ArrowLeft } from 'lucide-react'
import SmartImage from '@/components/SmartImage'
import { useBookingModal } from '@/hooks/useBookingModal'
import { STAY_UNITS, IMAGES } from '@/content/siteContent'

interface PageProps {
  params: {
    houseSlug: string
  }
}

export default function HouseDetailPage({ params }: PageProps) {
  const { openBooking } = useBookingModal()
  const unit = STAY_UNITS.find((u) => u.slug === params.houseSlug)

  if (!unit) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-serif text-earth-800 font-semibold mb-4">
          Unit Not Found
        </h1>
        <Link href="/stay" className="text-primary hover:underline">
          Return to Stays
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-sage-100 to-earth-100 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/stay"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Stays
          </Link>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif text-earth-800 font-bold mb-4">
              {unit.name}
            </h1>
            <p className="text-lg text-neutral-700 mb-6">{unit.description}</p>
            {unit.type === 'stay' && unit.bedrooms && unit.sleepsUpTo && (
              <div className="flex items-center gap-4 text-neutral-600">
                <span>{unit.bedrooms} bedroom{unit.bedrooms > 1 ? 's' : ''}</span>
                <span>•</span>
                <span>Sleeps up to {unit.sleepsUpTo}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Image */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <SmartImage
              src={IMAGES.units[unit.slug as keyof typeof IMAGES.units]?.src}
              alt={unit.imageLabel}
              aspectRatio="wide"
              priority
              fallbackLabel={unit.imageLabel}
            />
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-serif text-earth-800 font-semibold mb-6">
                About {unit.name}
              </h2>
              <p className="text-lg text-neutral-600 mb-6">{unit.description}</p>
              {unit.type === 'stay' && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-earth-800 mb-3">
                    Accommodation Details
                  </h3>
                  <ul className="space-y-2 text-neutral-600">
                    {unit.bedrooms && (
                      <li>{unit.bedrooms} bedroom{unit.bedrooms > 1 ? 's' : ''}</li>
                    )}
                    {unit.sleepsUpTo && <li>Sleeps up to {unit.sleepsUpTo} guests</li>}
                  </ul>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-serif text-earth-800 font-semibold mb-6">
                Amenities
              </h2>
              <ul className="space-y-3">
                {unit.amenities.map((amenity, index) => (
                  <li key={index} className="flex items-start text-neutral-600">
                    <span className="text-primary mr-2">•</span>
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-serif text-earth-800 font-semibold mb-4">
            Ready to Book?
          </h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Reserve {unit.name} for your {unit.type === 'stay' ? 'stay' : 'event'} at Arka Acres.
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              try {
                if (typeof openBooking === 'function') {
                  openBooking(unit.slug)
                } else {
                  throw new Error('openBooking is not a function')
                }
              } catch (error) {
                console.error('[HouseDetailPage] Error in Book This click handler', { slug: unit.slug, error })
                if (process.env.NODE_ENV !== 'production') {
                  alert(`Booking UI error — check console. Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
              }
            }}
            data-testid={`book-this-${unit.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-colors min-h-[44px]"
            aria-label={`Book ${unit.name} now`}
          >
            <Calendar size={20} />
            Book This
          </button>
        </div>
      </section>
    </>
  )
}

