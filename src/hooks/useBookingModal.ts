'use client'

import { useContext } from 'react'
import { BookingContext } from '@/components/BookingProvider'

export function useBookingModal() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBookingModal must be used within BookingProvider')
  }
  return context
}

