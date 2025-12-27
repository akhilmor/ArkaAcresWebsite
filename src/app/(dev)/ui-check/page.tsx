'use client'

// Dev-only UI check page to detect styling regressions
// Access at /ui-check in development mode only

import Container from '@/components/Container'
import SectionHeading from '@/components/SectionHeading'
import HouseCard from '@/components/HouseCard'
import { STAY_UNITS, IMAGES } from '@/content/siteContent'

export default function UICheckPage() {
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">This page is only available in development mode.</p>
      </div>
    )
  }

  const sampleUnit = STAY_UNITS[0]
  const unitImage = IMAGES.units[sampleUnit.slug as keyof typeof IMAGES.units]

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <Container maxWidth="6xl">
        <div className="mb-12">
          <h1 className="text-3xl font-serif text-earth-800 font-bold mb-4">
            UI Component Check
          </h1>
          <p className="text-neutral-600">
            This page verifies that design system components render correctly.
          </p>
        </div>

        {/* SectionHeading Check */}
        <section className="mb-12">
          <SectionHeading
            title="Section Heading Example"
            subtitle="This is a subtitle to verify typography and spacing"
          />
        </section>

        {/* HouseCard Check */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-earth-800 font-bold mb-6">
            HouseCard Component
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <HouseCard
              slug={sampleUnit.slug}
              name={sampleUnit.name}
              type={sampleUnit.type}
              bedrooms={sampleUnit.bedrooms}
              sleepsUpTo={sampleUnit.sleepsUpTo}
              description={sampleUnit.description}
              imageLabel={sampleUnit.imageLabel}
              imageSrc={unitImage?.src}
              amenities={[...sampleUnit.amenities]}
              onBookClick={(slug) => console.log('Book clicked:', slug)}
            />
          </div>
        </section>

        {/* Button Check */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-earth-800 font-bold mb-6">
            Button Styles
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">
              Primary Button
            </button>
            <button className="btn-secondary">
              Secondary Button
            </button>
          </div>
        </section>

        {/* Typography Check */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-earth-800 font-bold mb-6">
            Typography
          </h2>
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-earth-800 font-bold">
              Heading 1
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-earth-800 font-semibold">
              Heading 2
            </h2>
            <h3 className="text-xl sm:text-2xl font-serif text-earth-800 font-semibold">
              Heading 3
            </h3>
            <p className="text-base text-neutral-600 leading-relaxed">
              Body text with proper line height and color. This should be readable and have good spacing.
            </p>
          </div>
        </section>
      </Container>
    </div>
  )
}

