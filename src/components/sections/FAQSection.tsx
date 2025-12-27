'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { FAQSection as FAQSectionType } from '@/content/types'

interface FAQSectionProps {
  section: FAQSectionType
}

export default function FAQSection({ section }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-earth-800 font-bold mb-3 sm:mb-4">
          {section.heading}
        </h2>
        {section.subtitle && (
          <p className="text-base sm:text-lg text-neutral-600">
            {section.subtitle}
          </p>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4">
        {section.items.map((item, index) => {
          const isOpen = openIndex === index

          return (
            <div
              key={index}
              className="border border-neutral-200 rounded-lg overflow-hidden hover:border-primary/30 transition-colors bg-white"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors min-h-[44px]"
              >
                <span className="text-base sm:text-lg font-semibold text-earth-800 pr-3 sm:pr-4 break-words">
                  {item.q}
                </span>
                {isOpen ? (
                  <ChevronUp size={20} className="sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                ) : (
                  <ChevronDown size={20} className="sm:w-6 sm:h-6 text-neutral-400 flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed break-words">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

