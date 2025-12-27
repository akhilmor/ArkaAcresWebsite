'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Droplets, Leaf, Heart, BookOpen, Users, Sun } from 'lucide-react'
import type { FeatureGridSection as FeatureGridSectionType } from '@/content/types'

interface FeatureGridSectionProps {
  section: FeatureGridSectionType
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Sparkles,
  Droplets,
  Leaf,
  Heart,
  BookOpen,
  Users,
  Sun,
}

export default function FeatureGridSection({ section }: FeatureGridSectionProps) {
  const gridCols = section.columns === 2 
    ? 'sm:grid-cols-2' 
    : section.columns === 4 
    ? 'sm:grid-cols-2 lg:grid-cols-4' 
    : 'sm:grid-cols-2 lg:grid-cols-3'

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

      <div className={`grid grid-cols-1 ${gridCols} gap-6 lg:gap-8 mb-8 sm:mb-10`}>
        {section.items.map((item, index) => {
          const IconComponent = item.icon ? iconMap[item.icon] : Sparkles
          const Icon = IconComponent || Sparkles

          return (
            <div
              key={index}
              className="card-base p-5 sm:p-6 h-full flex flex-col"
            >
              {Icon && (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0">
                  <Icon size={20} className="sm:w-6 sm:h-6 text-primary" />
                </div>
              )}
              <h3 className="text-lg sm:text-xl font-semibold text-earth-800 mb-2 sm:mb-3">
                {item.title}
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed flex-grow">
                {item.description}
              </p>
            </div>
          )
        })}
      </div>

      {section.cta && (
        <div className="text-center">
          {section.cta.external ? (
            <a
              href={section.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              {section.cta.label}
              <ArrowRight size={20} />
            </a>
          ) : (
            <Link
              href={section.cta.href}
              className="btn-secondary"
            >
              {section.cta.label}
              <ArrowRight size={20} />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

