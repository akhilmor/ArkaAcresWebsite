'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-neutral-200 overflow-hidden"
        >
          <button
            type="button"
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-50 transition-colors"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span className="font-semibold text-earth-800 pr-4">
              {item.question}
            </span>
            <ChevronDown
              className={`flex-shrink-0 text-neutral-400 transition-transform ${
                openIndex === index ? 'transform rotate-180' : ''
              }`}
              size={20}
            />
          </button>
          {openIndex === index && (
            <div className="px-6 pb-4 text-neutral-600">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

