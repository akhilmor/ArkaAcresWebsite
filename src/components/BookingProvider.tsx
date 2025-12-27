'use client'

import { createContext, useState, ReactNode } from 'react'
import BookingModal from './BookingModal'

interface BookingContextType {
  openBooking: (slug: string) => void
  closeBooking: () => void
  isOpen: boolean
  selectedUnitSlug: string | null
}

export const BookingContext = createContext<BookingContextType | null>(null)

interface BookingProviderProps {
  children: ReactNode
}

export default function BookingProvider({ children }: BookingProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUnitSlug, setSelectedUnitSlug] = useState<string | null>(null)

  const openBooking = (slug: string) => {
    try {
      if (!slug || typeof slug !== 'string') {
        throw new Error(`Invalid slug provided: ${slug}`)
      }
      console.log('[BookingProvider] Opening booking modal', { slug })
      setSelectedUnitSlug(slug)
      setIsOpen(true)
    } catch (error) {
      console.error('[BookingProvider] Error in openBooking', { slug, error })
      if (process.env.NODE_ENV !== 'production') {
        alert(`Booking error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const closeBooking = () => {
    setIsOpen(false)
    // Don't clear selectedUnitSlug immediately to prevent flash
    setTimeout(() => {
      setSelectedUnitSlug(null)
    }, 300)
  }

  return (
    <BookingContext.Provider
      value={{
        openBooking,
        closeBooking,
        isOpen,
        selectedUnitSlug,
      }}
    >
      {children}
      {selectedUnitSlug && (
        <BookingModal
          isOpen={isOpen}
          onClose={closeBooking}
          unitSlug={selectedUnitSlug}
        />
      )}
    </BookingContext.Provider>
  )
}

