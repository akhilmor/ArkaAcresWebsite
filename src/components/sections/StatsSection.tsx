'use client'

import type { StatsSection as StatsSectionType } from '@/content/types'

interface StatsSectionProps {
  section: StatsSectionType
}

export default function StatsSection({ section }: StatsSectionProps) {
  const bgClass = section.backgroundColor === 'sage' 
    ? 'bg-sage-50' 
    : section.backgroundColor === 'neutral' 
    ? 'bg-neutral-50' 
    : 'bg-white'

  return (
    <div className="w-full">
      {section.heading && (
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-earth-800 font-bold mb-8 sm:mb-12 text-center">
          {section.heading}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
        {section.items.map((item, index) => (
          <div key={index} className="text-center">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-serif text-primary font-bold mb-2">
              {item.value}
              {item.suffix && <span className="text-2xl sm:text-3xl lg:text-4xl">{item.suffix}</span>}
            </div>
            <div className="text-base sm:text-lg lg:text-xl text-neutral-700 font-medium">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

