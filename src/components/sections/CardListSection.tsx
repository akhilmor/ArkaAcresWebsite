'use client'

import Link from 'next/link'
import { ArrowRight, Sprout, BookOpen, Heart, Users, Sparkles, Calendar, Leaf, Droplets } from 'lucide-react'
import SmartImage from '@/components/SmartImage'
import type { CardListSection as CardListSectionType } from '@/content/types'

interface CardListSectionProps {
  section: CardListSectionType
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Farm: Sprout, // Use Sprout as Farm icon replacement
  Sprout,
  BookOpen,
  Heart,
  Users,
  Sparkles,
  Calendar,
  Leaf,
  Droplets,
}

export default function CardListSection({ section }: CardListSectionProps) {
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

      {section.groupHeading && (
        <h3 className="text-lg sm:text-xl font-semibold text-earth-800 mb-4 sm:mb-6">
          {section.groupHeading}
        </h3>
      )}

      <div className={`grid grid-cols-1 ${gridCols} gap-4 sm:gap-6`}>
        {section.items.map((item, index) => {
          const IconComponent = item.icon ? iconMap[item.icon] : Sparkles
          const Icon = IconComponent || Sparkles

          return (
            <Link
              key={index}
              href={item.href}
              className="group card-base p-5 sm:p-6 hover:shadow-xl transition-all hover:border-primary/30 h-full flex flex-col"
            >
              {item.imageLabel && (
                <div className="mb-3 sm:mb-4 min-w-0">
                  <SmartImage
                    src={item.imageSrc}
                    alt={item.imageLabel}
                    aspectRatio="wide"
                    fallbackLabel={item.imageLabel}
                  />
                </div>
              )}
              {Icon && !item.imageLabel && (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <Icon size={20} className="sm:w-6 sm:h-6 text-primary" />
                </div>
              )}
              <h3 className="text-lg sm:text-xl font-semibold text-earth-800 mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-3 flex-grow">
                {item.description}
              </p>
              <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                Learn more
                <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

