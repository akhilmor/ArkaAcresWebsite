'use client'

import ContactForm from '@/components/ContactForm'
import type { ContactSection as ContactSectionType } from '@/content/types'

interface ContactSectionProps {
  section: ContactSectionType
}

export default function ContactSection({ section }: ContactSectionProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-earth-800 font-bold mb-3 sm:mb-4">
          {section.heading}
        </h2>
        {section.description && (
          <p className="text-base sm:text-lg text-neutral-600">
            {section.description}
          </p>
        )}
      </div>

      {section.showForm !== false && <ContactForm />}
    </div>
  )
}

