'use client'

import { useState, FormEvent, useEffect } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { STAY_UNITS } from '@/content/siteContent'
import BookingCalendar from './BookingCalendar'
import { DateRange } from 'react-day-picker'
import { format, addDays, isSameDay } from 'date-fns'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  unitSlug: string
}

export default function BookingModal({ isOpen, onClose, unitSlug }: BookingModalProps) {
  // Guardrail: Validate props
  useEffect(() => {
    if (isOpen && !unitSlug) {
      console.error('[BookingModal] Modal opened without unitSlug', { isOpen, unitSlug })
    }
    if (isOpen && !unit) {
      console.error('[BookingModal] Modal opened with invalid unitSlug', { isOpen, unitSlug, availableUnits: STAY_UNITS.map(u => u.slug) })
    }
  }, [isOpen, unitSlug])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '',
    startTime: '',
    endTime: '',
    eventType: '',
    message: '',
    honey: '', // Honeypot
  })
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [requestId, setRequestId] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [bookingResponse, setBookingResponse] = useState<any>(null)

  const unit = STAY_UNITS.find((u) => u.slug === unitSlug)

  // Guardrail: Validate props
  useEffect(() => {
    if (isOpen && !unitSlug) {
      console.error('[BookingModal] Modal opened without unitSlug', { isOpen, unitSlug })
    }
    if (isOpen && !unit) {
      console.error('[BookingModal] Modal opened with invalid unitSlug', { isOpen, unitSlug, availableUnits: STAY_UNITS.map(u => u.slug) })
    }
  }, [isOpen, unitSlug, unit])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      
      // Handle Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('keydown', handleEscape)
      }
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        guests: '',
        startTime: '',
        endTime: '',
        eventType: '',
        message: '',
        honey: '',
      })
      setDateRange(undefined)
      setEventDate(undefined)
      setSubmitted(false)
      setLoading(false)
      setError(null)
      setFieldErrors({})
      setRequestId(null)
      setDebugInfo(null)
      setBookingResponse(null)
    }
  }, [isOpen, unitSlug])

  if (!isOpen) return null

  if (!unit) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        <div
          className="bg-white rounded-lg shadow-xl w-[95vw] sm:w-[600px] max-w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <h2 className="text-xl font-serif text-earth-800 font-semibold mb-4">
              Unit Not Found
            </h2>
            <p className="text-neutral-600 mb-6">
              The selected unit could not be found. Please try again.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-colors min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate and normalize dates
      let normalizedCheckIn: Date | undefined
      let normalizedCheckOut: Date | undefined

      if (unit.type === 'stay') {
        if (!dateRange?.from) {
          setError('Please select a check-in date')
          setLoading(false)
          return
        }

        normalizedCheckIn = dateRange.from

        // Normalize: if to is missing or same as from, set to = from + 1 day (1-night stay)
        if (!dateRange.to || isSameDay(dateRange.from, dateRange.to)) {
          normalizedCheckOut = addDays(dateRange.from, 1)
        } else {
          normalizedCheckOut = dateRange.to
        }

        // Final validation
        if (normalizedCheckOut <= normalizedCheckIn) {
          setError('Check-out date must be after check-in date')
          setLoading(false)
          return
        }
      } else {
        if (!eventDate) {
          setError('Please select an event date')
          setLoading(false)
          return
        }
      }

      // Prepare payload - ensure we use the unit's slug from the found unit object
      const payload = {
        unitSlug: unit.slug, // Use unit.slug to ensure it matches what's in the database
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        checkIn: normalizedCheckIn ? format(normalizedCheckIn, 'yyyy-MM-dd') : undefined,
        checkOut: normalizedCheckOut ? format(normalizedCheckOut, 'yyyy-MM-dd') : undefined,
        eventDate: unit.type === 'event' && eventDate ? format(eventDate, 'yyyy-MM-dd') : undefined,
        startTime: unit.type === 'event' ? (formData.startTime || undefined) : undefined,
        endTime: unit.type === 'event' ? (formData.endTime || undefined) : undefined,
        eventType: unit.type === 'event' ? formData.eventType || undefined : undefined,
        guests: formData.guests || undefined,
        notes: formData.message.trim() || undefined,
        honey: formData.honey, // Honeypot
      }

      // Dev-only logging
      if (process.env.NODE_ENV !== 'production') {
        console.log('[BookingModal] Submitting booking for unitSlug=', payload.unitSlug, {
          unitName: unit.name,
          unitType: unit.type,
          checkIn: payload.checkIn,
          checkOut: payload.checkOut,
          eventDate: payload.eventDate,
        })
      }

      // Send to API
      let response: Response
      let data: any

      try {
        response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        // Try to parse JSON
        const text = await response.text()
        try {
          if (!text || text.trim().length === 0) {
            throw new Error('Empty response body')
          }
          data = JSON.parse(text)
        } catch (parseError) {
          // If JSON parsing fails, check if it's an HTML error page
          setLoading(false)
          const isHtmlError = text.trim().startsWith('<!') || text.includes('<html')
          const is500 = response.status === 500
          
          if (is500 && isHtmlError) {
            // Server error - likely Prisma client missing or other server issue
            setError('Server error: The booking system is temporarily unavailable. Please try again in a moment or contact support.')
            setRequestId(null)
            setDebugInfo({ 
              serverError: 'Received HTML error page instead of JSON',
              status: response.status,
              statusText: response.statusText,
              hint: 'This usually means Prisma client is missing. Check server logs.',
            })
          } else {
            // Other parse error
            setError('Failed to process server response. Please try again.')
            setRequestId(null)
            setDebugInfo({ 
              parseError: 'Failed to parse response',
              responseText: text ? text.substring(0, 500) : 'No response text',
              status: response.status,
              statusText: response.statusText,
            })
          }
          return
        }
      } catch (networkError) {
        setLoading(false)
        // Distinguish between network errors and server errors
        const errorMsg = networkError instanceof Error ? networkError.message : 'Unknown error'
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
          setError('Network error. Please check your connection and try again.')
        } else {
          setError('Server error. Please try again in a moment.')
        }
        setRequestId(null)
        setDebugInfo({ 
          networkError: errorMsg,
          type: 'fetch_error',
        })
        return
      }

      // Handle error responses - ALWAYS show server message
      if (!response.ok || !data.ok) {
        setLoading(false)
        setRequestId(data.requestId || null)
        setDebugInfo(process.env.NODE_ENV !== 'production' ? data : null)

        const errorCode = data.errorCode || 'UNKNOWN'
        // ALWAYS use server message, never generic fallback
        const message = data.message || `Error: ${errorCode}`

        // Handle specific error codes
        if (errorCode === 'VALIDATION') {
          setError(message)
          setFieldErrors(data.fieldErrors || {})
          return
        }

        if (errorCode === 'OVERLAP') {
          setError(message)
          // Highlight date picker visually
          return
        }

        if (errorCode === 'RATE_LIMIT') {
          const retryMsg = data.retryAfterSeconds 
            ? `Please try again in ${data.retryAfterSeconds} seconds.`
            : 'Please try again in a minute.'
          setError(`${message} ${retryMsg}`)
          return
        }

        if (errorCode === 'SCHEMA_MISMATCH') {
          setError('Site is updating—please try again in a few minutes.')
          if (process.env.NODE_ENV !== 'production') {
            setDebugInfo({ 
              ...data, 
              schemaError: data.debug,
              fixCommand: 'Run: npx prisma db push && restart dev server',
            })
          }
          return
        }

        // Show server message for any other error
        setError(message)
        return
      }

      // Success - booking is always saved (DB is source of truth)
      setSubmitted(true)
      setLoading(false)
      setRequestId(data.requestId || null)
      setBookingResponse(data) // Store full response for success UI
      
      // Check notification status
      const notificationStatus = data.notificationStatus || data.notifications || {}
      const warnings = data.warnings || []
      
      // Log notification status for debugging (not shown to user)
      if (notificationStatus.guestEmail === 'failed' || notificationStatus.ownerEmail === 'failed' || notificationStatus.ownerSms === 'failed') {
        console.warn('[BOOKING] Some notifications failed:', {
          bookingId: data.bookingId,
          requestId: data.requestId,
          notificationStatus,
          warnings,
        })
      }
      
      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          guests: '',
          startTime: '',
          endTime: '',
          eventType: '',
          message: '',
          honey: '',
        })
        setDateRange(undefined)
        setEventDate(undefined)
        setFieldErrors({})
      }, 100)
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setRequestId(null)
      setDebugInfo({ unexpectedError: err instanceof Error ? err.message : 'Unknown' })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="booking-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[95vw] sm:w-[600px] lg:w-[700px] max-w-full max-h-[85vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <div className="min-w-0 flex-1 pr-2">
            <h2 id="booking-modal-title" className="text-xl sm:text-2xl font-serif text-earth-800 font-semibold break-words">
              Request Booking — {unit.name}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              {unit.type === 'stay' ? 'Accommodation' : 'Event Venue'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-earth-800 mb-2">
                Request Received!
              </h3>
              {bookingResponse?.notifications?.guestEmail === 'sent' ? (
                <p className="text-neutral-600 mb-4">
                  A confirmation email has been sent to <strong>{formData.email}</strong>. We&apos;ll review your request and confirm shortly.
                </p>
              ) : bookingResponse?.notifications?.guestEmail === 'failed' ? (
                <p className="text-neutral-600 mb-4">
                  Your request has been saved. We&apos;ll contact you soon. If you don&apos;t hear from us, please reach out directly.
                </p>
              ) : (
                <p className="text-neutral-600 mb-4">
                  Your request has been received. We&apos;ll review it and contact you shortly to confirm your reservation.
                </p>
              )}
              {bookingResponse?.bookingId && (
                <p className="text-sm font-medium text-neutral-700 mb-2">
                  Booking ID: <span className="font-mono">{bookingResponse.bookingId}</span>
                </p>
              )}
              {bookingResponse?.notifications && (
                <div className="space-y-2 mb-4">
                  {bookingResponse.notifications.guestEmail === 'sent' ? (
                    <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                      ✓ Confirmation email sent to you at <span className="font-medium">{formData.email}</span>.
                    </p>
                  ) : bookingResponse.notifications.guestEmail === 'failed' ? (
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      Request saved. Email system not configured yet. We&apos;ll still receive it in admin and follow up.
                    </p>
                  ) : null}
                  {bookingResponse.warnings && (bookingResponse.warnings.includes('RESEND_NOT_CONFIGURED') || bookingResponse.warnings.includes('TWILIO_NOT_CONFIGURED') || bookingResponse.warnings.includes('NO_EMAIL_PROVIDER_CONFIGURED')) && (
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      Request saved successfully, but notification configuration is pending. We&apos;ll still receive it in admin and follow up.
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-colors min-h-[44px]"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot field */}
              <input
                type="text"
                name="honey"
                value={formData.honey}
                onChange={(e) => setFormData({ ...formData, honey: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-800 break-words">{error}</p>
                    </div>
                  </div>
                  {requestId && (
                    <p className="text-xs text-red-600 ml-8">Request ID: {requestId}</p>
                  )}
                  {/* Dev-only debug panel */}
                  {process.env.NODE_ENV !== 'production' && debugInfo && (
                    <details className="mt-2 ml-8">
                      <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                        Debug details
                      </summary>
                      <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Unit Info */}
              <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-earth-800 mb-2">{unit.name}</h3>
                {unit.type === 'stay' && unit.bedrooms && unit.sleepsUpTo && (
                  <p className="text-sm text-neutral-600">
                    {unit.bedrooms} bedroom{unit.bedrooms > 1 ? 's' : ''} • Sleeps up to {unit.sleepsUpTo}
                  </p>
                )}
                {unit.type === 'event' && (
                  <p className="text-sm text-neutral-600">Event venue</p>
                )}
              </div>

              {/* Calendar */}
              <BookingCalendar
                unitSlug={unitSlug}
                unitType={unit.type}
                selectedRange={dateRange}
                onSelectRange={setDateRange}
                onSelectDate={(date) => {
                  setEventDate(date)
                  setDateRange(date ? { from: date, to: date } : undefined)
                }}
              />

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  disabled={loading}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' })
                  }}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
                    fieldErrors.name ? 'border-red-300' : 'border-neutral-300'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  disabled={loading}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
                  }}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
                    fieldErrors.email ? 'border-red-300' : 'border-neutral-300'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone {unit.type === 'event' ? '*' : '(optional)'}
                </label>
                <input
                  type="tel"
                  id="phone"
                  required={unit.type === 'event'}
                  disabled={loading}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Stay: Guests */}
              {unit.type === 'stay' && (
                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-neutral-700 mb-2">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    id="guests"
                    required
                    disabled={loading}
                    min="1"
                    max={unit.sleepsUpTo || 15}
                    value={formData.guests}
                    onChange={(e) => {
                      setFormData({ ...formData, guests: e.target.value })
                      if (fieldErrors.guests) setFieldErrors({ ...fieldErrors, guests: '' })
                    }}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
                      fieldErrors.guests ? 'border-red-300' : 'border-neutral-300'
                    }`}
                  />
                  {fieldErrors.guests && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.guests}</p>
                  )}
                </div>
              )}

              {/* Event: Times, Type, Guests */}
              {unit.type === 'event' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-neutral-700 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        id="startTime"
                        required
                        disabled={loading}
                        value={formData.startTime || ''}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-neutral-700 mb-2">
                        End Time *
                      </label>
                      <input
                        type="time"
                        id="endTime"
                        required
                        disabled={loading}
                        value={formData.endTime || ''}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="eventType" className="block text-sm font-medium text-neutral-700 mb-2">
                      Event Type *
                    </label>
                    <select
                      id="eventType"
                      required
                      disabled={loading}
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select event type</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Corporate Event">Corporate Event</option>
                      <option value="Celebration">Celebration</option>
                      <option value="Community Gathering">Community Gathering</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-neutral-700 mb-2">
                      Estimated Attendees *
                    </label>
                    <input
                      type="number"
                      id="guests"
                      required
                      disabled={loading}
                      min="1"
                      max="100"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              )}

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="message"
                  rows={4}
                  disabled={loading}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Any special requests or questions?"
                />
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-white -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-5 sm:px-6 py-3 text-sm font-semibold text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-5 sm:px-6 py-3 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Request Booking'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
