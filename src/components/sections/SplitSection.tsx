'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import SmartImage from '@/components/SmartImage'
import type { SplitSection as SplitSectionType } from '@/content/types'

interface SplitSectionProps {
  section: SplitSectionType
}

export default function SplitSection({ section }: SplitSectionProps) {
  const contentOrder = section.reverse ? 'md:order-2' : 'md:order-1'
  const imageOrder = section.reverse ? 'md:order-1' : 'md:order-2'

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Content */}
        <div className={`${contentOrder} min-w-0`}>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-earth-800 font-bold mb-4 sm:mb-6">
            {section.heading}
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 mb-4 sm:mb-6 leading-relaxed max-w-prose">
            {section.body}
          </p>

          {section.bullets && section.bullets.length > 0 && (
            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {section.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start text-sm sm:text-base text-neutral-700 break-words">
                  <Check size={18} className="sm:w-5 sm:h-5 text-primary mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span className="min-w-0">{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {section.cta && (
            <div>
              {section.cta.external ? (
                <a
                  href={section.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  {section.cta.label}
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </a>
              ) : (
                <Link
                  href={section.cta.href}
                  className="btn-secondary"
                >
                  {section.cta.label}
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Image */}
        <div className={`${imageOrder} min-w-0`}>
          <SmartImage
            src={section.imageSrc}
            alt={section.imageLabel || 'Section image'}
            aspectRatio="square"
            fallbackLabel={section.imageLabel}
          />
        </div>
      </div>
    </div>
  )
}

