import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Mail, ArrowLeft } from 'lucide-react'
import Container from '@/components/Container'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | Arka Acres',
  description: 'Have questions about your stay or about the Goshala? Reach us directly.',
}

export default function ContactPage() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <Container maxWidth="4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-earth-800 font-bold mb-4">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
            Have questions about your stay or about the Goshala? Reach us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto mb-12">
          {/* Phone Card */}
          <div className="bg-neutral-50 rounded-lg p-6 sm:p-8 border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Phone size={32} className="text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-earth-800 mb-2">Phone</h2>
              <a
                href="tel:+14695369018"
                className="text-2xl sm:text-3xl font-semibold text-primary hover:text-primary-dark transition-colors mb-2"
              >
                +1 (469) 536-9018
              </a>
              <p className="text-sm text-neutral-600">Tap to call</p>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-neutral-50 rounded-lg p-6 sm:p-8 border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail size={32} className="text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-earth-800 mb-2">Email</h2>
              <a
                href="mailto:arkaacres@gmail.com"
                className="text-lg sm:text-xl font-semibold text-primary hover:text-primary-dark transition-colors mb-2 break-all"
              >
                arkaacres@gmail.com
              </a>
              <p className="text-sm text-neutral-600">Tap to email</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
            <h2 className="text-xl font-semibold text-earth-800 mb-4 text-center">
              Send us a message
            </h2>
            <ContactForm />
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto">
            We&apos;ll do our best to respond within 24 hours. Thank you for your patience and support for our Gomathas!
          </p>
          
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </Container>
    </section>
  )
}

