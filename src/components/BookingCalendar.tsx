'use client'

import { useState, useEffect } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format, isSameDay } from 'date-fns'

interface BookingCalendarProps {
  unitSlug: string
  unitType: 'stay' | 'event'
  selectedRange: DateRange | undefined
  onSelectRange: (range: DateRange | undefined) => void
  onSelectDate: (date: Date | undefined) => void
  className?: string
}

export default function BookingCalendar({
  unitSlug,
  unitType,
  selectedRange,
  onSelectRange,
  onSelectDate,
  className = '',
}: BookingCalendarProps) {
  const [disabledDates, setDisabledDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date())

  useEffect(() => {
    fetchAvailability()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSlug, month])

  const fetchAvailability = async () => {
    setLoading(true)
    try {
      // Fetch 3 months of availability (current month + 2 ahead)
      const from = new Date(month.getFullYear(), month.getMonth(), 1)
      const to = new Date(month.getFullYear(), month.getMonth() + 3, 0)

      const response = await fetch(
        `/api/availability?unitSlug=${unitSlug}&from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}`
      )

      // Check if response is OK
      if (!response.ok) {
        // Try to read response as text first
        const text = await response.text()
        let errorMessage = 'Failed to fetch availability'
        
        // Try to parse as JSON if possible
        try {
          const errorData = JSON.parse(text)
          errorMessage = errorData.error || errorMessage
        } catch {
          // If it's HTML (error page), show generic error
          if (text.trim().startsWith('<!') || text.includes('<html')) {
            errorMessage = 'Server error. Please try again in a moment.'
          }
        }
        
        console.error('Availability API error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
        })
        return
      }

      // Check content-type before parsing JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Availability API returned non-JSON response:', {
          contentType,
          preview: text.substring(0, 200),
        })
        return
      }

      const data = await response.json()

      if (data.ok) {
        const disabled = data.disabledDates.map((d: string) => new Date(d))
        setDisabledDates(disabled)
      } else {
        console.error('Availability API returned error:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error)
      // Don't show error to user, just log it - calendar will work with empty disabled dates
    } finally {
      setLoading(false)
    }
  }

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return true

    // Disable dates from API
    return disabledDates.some((disabled) => isSameDay(disabled, date))
  }

  if (unitType === 'event') {
    // Single date picker for events
    return (
      <div className={className}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Select Event Date *
          </label>
          <DayPicker
            mode="single"
            selected={selectedRange?.from}
            onSelect={(date) => {
              onSelectDate(date)
              onSelectRange(date ? { from: date, to: date } : undefined)
            }}
            disabled={isDateDisabled}
            month={month}
            onMonthChange={setMonth}
            className="rounded-lg border border-neutral-200 p-4 bg-white"
            classNames={{
              months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-4',
              caption: 'flex justify-center pt-1 relative items-center',
              caption_label: 'text-sm font-medium text-neutral-900',
              nav: 'space-x-1 flex items-center',
              nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
              nav_button_previous: 'absolute left-1',
              nav_button_next: 'absolute right-1',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex',
              head_cell: 'text-neutral-500 rounded-md w-9 font-normal text-[0.8rem]',
              row: 'flex w-full mt-2',
              cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
              day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-neutral-100 rounded-md',
              day_selected: 'bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white',
              day_today: 'bg-neutral-100 text-neutral-900',
              day_outside: 'text-neutral-400 opacity-50',
              day_disabled: 'text-neutral-300 opacity-50 cursor-not-allowed',
              day_range_middle: 'aria-selected:bg-primary/10 aria-selected:text-neutral-900',
              day_hidden: 'invisible',
            }}
          />
        </div>
        {loading && (
          <p className="text-xs text-neutral-500 text-center">Loading availability...</p>
        )}
      </div>
    )
  }

  // Date range picker for stays
  return (
    <div className={className}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Select Check-in and Check-out Dates *
        </label>
        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={onSelectRange}
          disabled={isDateDisabled}
          numberOfMonths={1}
          month={month}
          onMonthChange={setMonth}
          className="rounded-lg border border-neutral-200 p-4 bg-white"
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4',
            caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-sm font-medium text-neutral-900',
            nav: 'space-x-1 flex items-center',
            nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
            nav_button_previous: 'absolute left-1',
            nav_button_next: 'absolute right-1',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex',
            head_cell: 'text-neutral-500 rounded-md w-9 font-normal text-[0.8rem]',
            row: 'flex w-full mt-2',
            cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-neutral-100 rounded-md',
            day_selected: 'bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white',
            day_today: 'bg-neutral-100 text-neutral-900',
            day_outside: 'text-neutral-400 opacity-50',
            day_disabled: 'text-neutral-300 opacity-50 cursor-not-allowed',
            day_range_middle: 'aria-selected:bg-primary/10 aria-selected:text-neutral-900',
            day_hidden: 'invisible',
          }}
        />
      </div>
      {selectedRange?.from && (
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg text-sm">
          {selectedRange.to && !isSameDay(selectedRange.from, selectedRange.to) ? (
            <p className="text-neutral-700">
              <span className="font-medium">Check-in:</span> {format(selectedRange.from, 'PPP')}
              <br />
              <span className="font-medium">Check-out:</span> {format(selectedRange.to, 'PPP')}
            </p>
          ) : (
            <p className="text-neutral-700">
              <span className="font-medium">Check-in:</span> {format(selectedRange.from, 'PPP')}
              <br />
              <span className="text-neutral-500 italic">
                {selectedRange.to && isSameDay(selectedRange.from, selectedRange.to)
                  ? '1-night stay (check-out will be set automatically)'
                  : 'Select check-out date (or leave same for 1-night stay)'}
              </span>
            </p>
          )}
        </div>
      )}
      {loading && (
        <p className="text-xs text-neutral-500 text-center mt-2">Loading availability...</p>
      )}
      <div className="mt-4 flex items-center gap-4 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-neutral-300 rounded"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  )
}

