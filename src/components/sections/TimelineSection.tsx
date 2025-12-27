'use client'

import Timeline from '@/components/Timeline'
import type { TimelineSection as TimelineSectionType } from '@/content/types'

interface TimelineSectionProps {
  section: TimelineSectionType
}

export default function TimelineSection({ section }: TimelineSectionProps) {
  return (
    <div className="w-full">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-earth-800 font-bold mb-3 sm:mb-4">
          {section.heading}
        </h2>
        {section.subtitle && (
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
            {section.subtitle}
          </p>
        )}
      </div>
      <Timeline items={section.items} />
    </div>
  )
}

