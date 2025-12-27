import Link from 'next/link'
import { Calendar } from 'lucide-react'
import SmartImage from '@/components/SmartImage'

interface HouseCardProps {
  slug: string
  name: string
  type: 'stay' | 'event'
  bedrooms?: number
  sleepsUpTo?: number
  description: string
  imageLabel: string
  imageSrc?: string
  amenities: string[]
  onBookClick: (slug: string) => void
}

export default function HouseCard({
  slug,
  name,
  type,
  bedrooms,
  sleepsUpTo,
  description,
  imageLabel,
  imageSrc,
  amenities,
  onBookClick,
}: HouseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Image */}
      <div className="h-48 sm:h-64 relative">
        <SmartImage
          src={imageSrc}
          alt={imageLabel}
          aspectRatio="wide"
          fallbackLabel={imageLabel}
        />
      </div>

      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl sm:text-2xl font-serif text-earth-800 font-semibold mb-1 break-words">
              {name}
            </h3>
            <span className="inline-block px-2 sm:px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
              {type === 'stay' ? 'Stay' : 'Event'}
            </span>
          </div>
        </div>

        {type === 'stay' && bedrooms && sleepsUpTo && (
          <div className="mb-2 sm:mb-3 text-xs sm:text-sm text-neutral-600">
            <span className="font-medium">{bedrooms} bedroom{bedrooms > 1 ? 's' : ''}</span>
            {sleepsUpTo > 0 && (
              <>
                <span className="mx-2">•</span>
                <span className="font-medium">Sleeps up to {sleepsUpTo}</span>
              </>
            )}
          </div>
        )}

        <p className="text-sm sm:text-base text-neutral-600 mb-3 sm:mb-4 flex-grow break-words">{description}</p>

        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm font-semibold text-earth-800 mb-2 sm:mb-3">Amenities:</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
            {amenities.map((amenity, index) => (
              <li key={index} className="text-xs sm:text-sm text-neutral-600 flex items-start break-words">
                <span className="text-primary mr-2 flex-shrink-0 mt-0.5">•</span>
                <span className="min-w-0">{amenity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
          <Link
            href={`/stay/${slug}`}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-primary border-2 border-primary rounded-md hover:bg-primary hover:text-white transition-colors text-center min-h-[44px] flex items-center justify-center"
          >
            Learn More
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              try {
                if (typeof onBookClick === 'function') {
                  onBookClick(slug)
                } else {
                  console.error('[HouseCard] onBookClick is not a function', { slug, onBookClick })
                  if (process.env.NODE_ENV !== 'production') {
                    alert(`Booking error: onBookClick is not a function. Check console.`)
                  }
                }
              } catch (error) {
                console.error('[HouseCard] Error in Book Now click handler', { slug, error })
                if (process.env.NODE_ENV !== 'production') {
                  alert(`Booking UI error — check console. Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
              }
            }}
            data-testid={`book-now-${slug}`}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            aria-label={`Book ${name} now`}
          >
            <Calendar size={16} />
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}

