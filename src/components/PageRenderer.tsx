'use client'

import React from 'react'
import HeroSection from './sections/HeroSection'
import StatsSection from './sections/StatsSection'
import FeatureGridSection from './sections/FeatureGridSection'
import SplitSection from './sections/SplitSection'
import CardListSection from './sections/CardListSection'
import FAQSection from './sections/FAQSection'
import CTABandSection from './sections/CTABandSection'
import ContactSection from './sections/ContactSection'
import TimelineSection from './sections/TimelineSection'
import Container from './Container'
import type { Section } from '@/content/types'

interface PageRendererProps {
  sections: Section[]
}

export default function PageRenderer({ sections }: PageRendererProps) {
  return (
    <>
      {sections.map((section, index) => {
        // Determine background based on index (alternating)
        // Skip hero and ctaBand for alternation calculation
        const sectionIndex = section.type === 'hero' || section.type === 'ctaBand' 
          ? -1 
          : index
        const isEven = sectionIndex >= 0 && sectionIndex % 2 === 0
        const bgClass = isEven ? 'bg-white' : 'bg-neutral-50'
        
        // Hero and CTA sections get special treatment (no wrapper, they handle their own backgrounds)
        if (section.type === 'hero') {
          return <HeroSection key={`section-${index}`} section={section} />
        }
        
        if (section.type === 'ctaBand') {
          return <CTABandSection key={`section-${index}`} section={section} />
        }

        // All other sections get wrapped with proper spacing
        const renderSection = () => {
          switch (section.type) {
            case 'stats':
              return <StatsSection section={section} />
            case 'featureGrid':
              return <FeatureGridSection section={section} />
            case 'split':
              return <SplitSection section={section} />
            case 'cards':
              return <CardListSection section={section} />
            case 'faq':
              return <FAQSection section={section} />
            case 'contact':
              return <ContactSection section={section} />
            case 'timeline':
              return <TimelineSection section={section} />
            default:
              return null
          }
        }

        return (
          <section 
            key={`section-${index}`} 
            className={`py-16 sm:py-20 lg:py-24 ${bgClass}`}
          >
            <Container maxWidth="6xl">
              {renderSection()}
            </Container>
          </section>
        )
      })}
    </>
  )
}
