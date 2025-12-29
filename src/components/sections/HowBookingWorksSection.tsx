'use client'

import { CheckCircle } from 'lucide-react'
import Container from '@/components/Container'
import SectionHeading from '@/components/SectionHeading'

const steps = [
  {
    icon: CheckCircle,
    title: 'Pick a place',
    description: 'Choose a place to stay or book Aurora Grand for your event.',
  },
  {
    icon: CheckCircle,
    title: 'Pick dates and tell us about your group',
    description: 'Select your dates and let us know how many people are coming.',
  },
  {
    icon: CheckCircle,
    title: 'We\'ll confirm and send details',
    description: 'We\'ll check availability and send you everything you need to know.',
  },
  {
    icon: CheckCircle,
    title: 'Come and enjoy',
    description: 'Show up, relax, and enjoy the farm.',
  },
]

export default function HowBookingWorksSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-neutral-50">
      <Container maxWidth="6xl">
        <SectionHeading
          title="How It Works"
          subtitle="Booking is pretty simple. Here's the process."
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

