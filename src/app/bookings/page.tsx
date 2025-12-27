'use client'

import { useState, useEffect } from 'react'
import { Calendar, User, Mail, Phone, Users, Clock, MapPin, Trash2 } from 'lucide-react'
import Container from '@/components/Container'

interface Booking {
  name: string
  email: string
  phone: string
  checkIn?: string
  checkOut?: string
  eventDate?: string
  startTime?: string
  endTime?: string
  guests: string
  eventType?: string
  message?: string
  unit: string
  unitSlug: string
  timestamp: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load bookings from localStorage
    const stored = localStorage.getItem('bookings')
    if (stored) {
      try {
        // Only parse if we're in browser and have valid JSON
        if (typeof window === 'undefined' || !stored) {
          return
        }
        
        let parsed
        try {
          parsed = JSON.parse(stored)
        } catch (err) {
          console.warn('[BookingsPage] Failed to parse stored bookings', err)
          return
        }
        // Sort by timestamp, newest first
        const sorted = parsed.sort((a: Booking, b: Booking) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        setBookings(sorted)
      } catch (e) {
        console.error('Error parsing bookings:', e)
      }
    }
    setLoading(false)
  }, [])

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      const updated = bookings.filter((_, i) => i !== index)
      setBookings(updated)
      // Only access localStorage in browser
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem('bookings', JSON.stringify(updated))
        } catch (err) {
          console.warn('[BookingsPage] Failed to save to localStorage', err)
        }
      }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A'
    return timeString
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <Container>
          <div className="text-center py-20">
            <p className="text-neutral-600">Loading bookings...</p>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 sm:py-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-earth-800 font-bold mb-4">
            Bookings
          </h1>
          <p className="text-base sm:text-lg text-neutral-600">
            View all booking requests submitted through the site.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <Calendar className="mx-auto text-neutral-400 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-earth-800 mb-2">No bookings yet</h2>
            <p className="text-neutral-600">
              Booking requests will appear here once submitted.
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {bookings.map((booking, index) => {
              const isStay = !!booking.checkIn
              const isEvent = !!booking.eventDate

              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin size={18} className="text-primary flex-shrink-0" />
                          <h3 className="text-xl sm:text-2xl font-serif text-earth-800 font-semibold break-words">
                            {booking.unit}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                          <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">
                            {isStay ? 'Stay' : isEvent ? 'Event' : 'Booking'}
                          </span>
                          <span className="text-neutral-400">•</span>
                          <span>
                            {new Date(booking.timestamp).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-2 text-neutral-400 hover:text-red-600 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Delete booking"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 pb-4 border-b border-neutral-200">
                      <div className="flex items-start gap-2 min-w-0">
                        <User size={18} className="text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-neutral-500 mb-0.5">Name</p>
                          <p className="text-sm sm:text-base text-neutral-800 break-words">{booking.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 min-w-0">
                        <Mail size={18} className="text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-neutral-500 mb-0.5">Email</p>
                          <a
                            href={`mailto:${booking.email}`}
                            className="text-sm sm:text-base text-primary hover:underline break-all"
                          >
                            {booking.email}
                          </a>
                        </div>
                      </div>
                      {booking.phone && (
                        <div className="flex items-start gap-2 min-w-0">
                          <Phone size={18} className="text-primary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs text-neutral-500 mb-0.5">Phone</p>
                            <a
                              href={`tel:${booking.phone}`}
                              className="text-sm sm:text-base text-neutral-800 hover:text-primary break-all"
                            >
                              {booking.phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stay Details */}
                    {isStay && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 pb-4 border-b border-neutral-200">
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Check-in</p>
                          <p className="text-sm sm:text-base text-neutral-800">{formatDate(booking.checkIn)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Check-out</p>
                          <p className="text-sm sm:text-base text-neutral-800">{formatDate(booking.checkOut)}</p>
                        </div>
                        {booking.guests && (
                          <div className="flex items-start gap-2">
                            <Users size={18} className="text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Guests</p>
                              <p className="text-sm sm:text-base text-neutral-800">{booking.guests}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Event Details */}
                    {isEvent && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 pb-4 border-b border-neutral-200">
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Event Date</p>
                          <p className="text-sm sm:text-base text-neutral-800">{formatDate(booking.eventDate)}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock size={18} className="text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Time</p>
                            <p className="text-sm sm:text-base text-neutral-800">
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </p>
                          </div>
                        </div>
                        {booking.eventType && (
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Event Type</p>
                            <p className="text-sm sm:text-base text-neutral-800">{booking.eventType}</p>
                          </div>
                        )}
                        {booking.guests && (
                          <div className="flex items-start gap-2">
                            <Users size={18} className="text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-neutral-500 mb-1">Estimated Guests</p>
                              <p className="text-sm sm:text-base text-neutral-800">{booking.guests}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message */}
                    {booking.message && (
                      <div className="mb-4 pb-4 border-b border-neutral-200">
                        <p className="text-xs text-neutral-500 mb-1">Additional Notes</p>
                        <p className="text-sm sm:text-base text-neutral-700 whitespace-pre-wrap break-words">
                          {booking.message}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <a
                        href={`mailto:${booking.email}?subject=Re: Booking Request for ${booking.unit}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-primary border-2 border-primary rounded-md hover:bg-primary hover:text-white transition-colors min-h-[44px]"
                      >
                        <Mail size={16} />
                        Reply via Email
                      </a>
                      {booking.phone && (
                        <a
                          href={`tel:${booking.phone}`}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-neutral-700 border-2 border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors min-h-[44px]"
                        >
                          <Phone size={16} />
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Info Footer */}
        {bookings.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Bookings are stored locally in your browser. To access them from another device, 
              you&apos;ll need to export them or set up a backend system.
            </p>
          </div>
        )}
      </Container>
    </div>
  )
}

