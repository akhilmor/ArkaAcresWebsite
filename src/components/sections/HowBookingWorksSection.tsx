'use client'

import { CheckCircle } from 'lucide-react'
import Container from '@/components/Container'
import SectionHeading from '@/components/SectionHeading'

const steps = [
  {
    icon: CheckCircle,
    title: 'Select your stay or event venue',
    description: 'Choose from our comfortable accommodations or book Aurora Grand for your gathering.',
  },
  {
    icon: CheckCircle,
    title: 'Choose your dates and provide details',
    description: 'Select your check-in/check-out dates or event date, and tell us about your group.',
  },
  {
    icon: CheckCircle,
    title: 'We confirm availability and send details',
    description: 'We\'ll verify availability and send you confirmation with all the information you need.',
  },
  {
    icon: CheckCircle,
    title: 'Enjoy your time at Arka Acres',
    description: 'Relax, connect with nature, and experience the peaceful farm environment.',
  },
]

export default function HowBookingWorksSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-neutral-50">
      <Container maxWidth="6xl">
        <SectionHeading
          title="How Booking Works"
          subtitle="Booking your stay or event at Arka Acres is simple and straightforward."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-earth-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed flex-grow">
                  {step.description}
                </p>
                <div className="mt-4 text-xs font-semibold text-primary">
                  Step {index + 1}
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

