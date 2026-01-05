import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { sendBookingNotifications } from '@/lib/notifications'
import { serverLogBuffer } from '@/lib/serverLogBuffer'
import { addDays } from 'date-fns'

// Rate limiting - only count successful bookings in production
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 3
const RATE_LIMIT_DEV_MAX = 1000 // Very high limit in dev

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

function checkRateLimit(ip: string, isDev: boolean): { allowed: boolean; message?: string; retryAfter?: number } {
  // In dev, allow almost unlimited requests
  if (isDev) {
    return { allowed: true }
  }

  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return {
      allowed: false,
      message: 'Too many requests. Please try again in a minute.',
      retryAfter,
    }
  }

  record.count++
  return { allowed: true }
}

// Only increment rate limit on successful booking creation
function incrementRateLimit(ip: string) {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
  } else {
    record.count++
  }
}

// Validation schema - accept both unitSlug and unitId for safety
const bookingSchema = z.object({
  unitSlug: z.string().min(1).optional(),
  unitId: z.string().min(1).optional(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(20).optional(),
  // Stay fields
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.string().optional(),
  // Event fields
  eventDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  eventType: z.string().optional(),
  notes: z.string().max(2000).optional(),
  honey: z.string().max(0).optional(),
}).refine((data) => data.unitSlug || data.unitId, {
  message: 'Either unitSlug or unitId must be provided',
  path: ['unitSlug'],
})

async function checkAvailabilityOverlap(
  unitId: string,
  resourceGroup: string | null,
  checkIn: Date | null,
  checkOut: Date | null,
  eventDate: Date | null,
  startTime: string | null = null,
  endTime: string | null = null
): Promise<boolean> {
  try {
    // Get all unit IDs in the same resource group (if any)
    let unitIdsToCheck = [unitId]
    if (resourceGroup) {
      const groupUnits = await prisma.unit.findMany({
        where: { resourceGroup },
        select: { id: true },
      })
      unitIdsToCheck = groupUnits.map(u => u.id)
    }

    // Check bookings for all units in the group
    const existingBookings = await prisma.booking.findMany({
      where: {
        unitId: { in: unitIdsToCheck },
        status: {
          in: ['pending', 'confirmed'],
        },
        OR: [
          // Stay bookings
          {
            AND: [
              { checkIn: { not: null } },
              { checkOut: { not: null } },
            ],
          },
          // Event bookings
          {
            AND: [
              { eventDate: { not: null } },
            ],
          },
        ],
      },
      select: {
        checkIn: true,
        checkOut: true,
        eventDate: true,
        startTime: true,
        endTime: true,
      },
    })

    // Check stay overlaps
    if (checkIn && checkOut) {
      for (const booking of existingBookings) {
        if (booking.checkIn && booking.checkOut) {
          // Stay overlap: newCheckIn < existingEnd AND newCheckOut > existingStart
          if (checkIn < booking.checkOut && checkOut > booking.checkIn) {
            return true
          }
        }
      }
    }

    // Check event overlaps (same date, and if times provided, check time overlap)
    if (eventDate) {
      for (const booking of existingBookings) {
        if (booking.eventDate) {
          const existingDate = new Date(booking.eventDate)
          const newDate = new Date(eventDate)
          
          // Same date
          if (
            existingDate.getFullYear() === newDate.getFullYear() &&
            existingDate.getMonth() === newDate.getMonth() &&
            existingDate.getDate() === newDate.getDate()
          ) {
            // If both have times, check time overlap
            if (startTime && endTime && booking.startTime && booking.endTime) {
              // Parse times (HH:MM format)
              const [newStartH, newStartM] = startTime.split(':').map(Number)
              const [newEndH, newEndM] = endTime.split(':').map(Number)
              const [existingStartH, existingStartM] = booking.startTime.split(':').map(Number)
              const [existingEndH, existingEndM] = booking.endTime.split(':').map(Number)
              
              const newStartMinutes = newStartH * 60 + newStartM
              const newEndMinutes = newEndH * 60 + newEndM
              const existingStartMinutes = existingStartH * 60 + existingStartM
              const existingEndMinutes = existingEndH * 60 + existingEndM
              
              // Time overlap: newStart < existingEnd AND newEnd > existingStart
              if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
                return true
              }
            } else {
              // No times or one missing time - block the whole day
              return true
            }
          }
        }
      }
    }

    // Check blocked date ranges (by unitId OR resourceGroup)
    if (checkIn && checkOut) {
      // Stay: check if dates overlap with any blocked range
      const blockedOverlap = await prisma.blockedDateRange.findFirst({
        where: {
          OR: [
            { unitId: { in: unitIdsToCheck } },
            ...(resourceGroup ? [{ resourceGroup }] : []),
          ],
          startDate: { lt: checkOut },
          endDate: { gt: checkIn },
        },
      })
      if (blockedOverlap) {
        return true
      }
    } else if (eventDate) {
      // Event: check if event date falls within any blocked range
      const blockedOverlap = await prisma.blockedDateRange.findFirst({
        where: {
          OR: [
            { unitId: { in: unitIdsToCheck } },
            ...(resourceGroup ? [{ resourceGroup }] : []),
          ],
          startDate: { lte: eventDate },
          endDate: { gte: eventDate },
        },
      })
      if (blockedOverlap) {
        return true
      }
    }

    return false
  } catch (error: any) {
    serverLogBuffer.error('[BOOKING] Availability check error', {
      error: error?.message,
      stack: error?.stack,
    })
    // If we can't check availability, be conservative and allow (or could deny)
    // For now, allow but log the error
    return false
  }
}

function isPrismaSchemaError(error: any): boolean {
  if (!error) return false
  const message = error.message || ''
  return (
    message.includes('no such table') ||
    message.includes('no such column') ||
    message.includes('Unknown column') ||
    (message.includes('Table') && message.includes("doesn't exist")) ||
    error.code === 'P2001' || // Record not found (could be schema)
    error.code === 'P2002' || // Unique constraint (could be schema)
    error.code === 'P2010' || // Raw query error
    error.code === 'P2021' // Table does not exist
  )
}

// Safe booking creation - only writes fields that exist
// This function is used within a transaction, so it receives the tx client
async function createBookingSafe(
  tx: any, // Prisma transaction client
  data: {
    unitId: string
    status: string
    name: string
    email: string
    phone: string | null
    guests: number | null
    checkIn: Date | null
    checkOut: Date | null
    eventDate: Date | null
    startTime: string | null
    endTime: string | null
    eventType: string | null
    notes: string | null
  }
) {
  // Try with all fields first (new schema)
  try {
    return await tx.booking.create({
      data: {
        ...data,
        ownerEmailStatus: 'not_sent',
        ownerSmsStatus: 'not_sent',
        guestEmailStatus: 'not_sent',
        guestSmsStatus: 'not_sent',
      },
      include: {
        unit: true,
      },
    })
  } catch (error: any) {
    // If columns don't exist, try without them (old schema)
    const errorMessage = error?.message || ''
    if (
      isPrismaSchemaError(error) &&
      (errorMessage.includes('ownerEmailStatus') ||
        errorMessage.includes('ownerSmsStatus') ||
        errorMessage.includes('guestEmailStatus') ||
        errorMessage.includes('guestSmsStatus') ||
        errorMessage.includes('lastNotificationError') ||
        errorMessage.includes('no such column'))
    ) {
      serverLogBuffer.warn('[BOOKING] Notification status columns missing, creating without them', {
        error: errorMessage,
        code: error?.code,
      })
      // Fallback: create with only core fields
      return await tx.booking.create({
        data,
        include: {
          unit: true,
        },
      })
    }
    // Re-throw if it's not a schema error
    throw error
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const isDev = process.env.NODE_ENV !== 'production'
  
  // Wrap entire handler in try-catch to ensure we always return JSON
  try {
    // Test Prisma connection early
    try {
      await prisma.$connect()
    } catch (prismaError: any) {
      serverLogBuffer.error('[BOOKING] Prisma connection failed', {
        requestId,
        error: prismaError?.message,
        stack: prismaError?.stack,
      })
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'DATABASE_ERROR',
          message: 'Database connection failed. Please try again later.',
          requestId,
          ...(isDev && {
            debug: prismaError?.message,
            hint: 'Check DATABASE_URL and Prisma client initialization',
          }),
        },
        { status: 500 }
      )
    }
  
  try {
    // Parse and validate JSON first (before rate limiting)
    let body: any
    try {
      body = await request.json()
    } catch (error) {
      serverLogBuffer.warn('[BOOKING] Invalid JSON', { requestId, error: error instanceof Error ? error.message : 'Unknown' })
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'INVALID_JSON',
          message: 'Invalid request format. Please try again.',
          requestId,
        },
        { status: 400 }
      )
    }

    // Honeypot check
    if (body.honey && body.honey.length > 0) {
      const ip = getClientIP(request)
      serverLogBuffer.warn('[BOOKING] Honeypot triggered', { ip, requestId })
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'SPAM_DETECTED',
          message: 'Invalid request',
          requestId,
        },
        { status: 400 }
      )
    }

    // Zod validation
    let validated: z.infer<typeof bookingSchema>
    try {
      validated = bookingSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        })

        serverLogBuffer.warn('[BOOKING] Validation error', { requestId, errors: error.issues })
        return NextResponse.json(
          {
            ok: false,
            errorCode: 'VALIDATION',
            message: 'Please fill all required fields correctly.',
            fieldErrors,
            requestId,
          },
          { status: 400 }
        )
      }
      throw error
    }

    // Determine lookup method (prefer slug, fallback to id)
    const lookupBy = validated.unitSlug ? 'slug' : 'id'
    const lookupValue = validated.unitSlug || validated.unitId

    if (!lookupValue) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'VALIDATION',
          message: 'Either unitSlug or unitId must be provided',
          fieldErrors: {
            unitSlug: 'Unit identifier is required',
          },
          requestId,
        },
        { status: 400 }
      )
    }

    serverLogBuffer.info('[BOOKING] Request received', {
      requestId,
      unitSlug: validated.unitSlug,
      unitId: validated.unitId,
      lookupBy,
      checkIn: validated.checkIn,
      checkOut: validated.checkOut,
      eventDate: validated.eventDate,
    })

    // Find unit by slug (preferred) or id (fallback)
    let unit
    try {
      // Prefer slug lookup, fallback to id
      if (validated.unitSlug) {
        unit = await prisma.unit.findUnique({
          where: { slug: validated.unitSlug },
        })
      } else if (validated.unitId) {
        unit = await prisma.unit.findUnique({
          where: { id: validated.unitId },
        })
      }

      // If still not found, list all units for debugging
      if (!unit && validated.unitSlug) {
        serverLogBuffer.warn('[BOOKING] Unit not found by slug, listing all units', {
          requestId,
          unitSlug: validated.unitSlug,
        })
        const allUnits = await prisma.unit.findMany({
          select: { id: true, slug: true, name: true },
        })
        serverLogBuffer.info('[BOOKING] Available units in DB', {
          requestId,
          units: allUnits,
        })
      }
    } catch (error: any) {
      if (isPrismaSchemaError(error)) {
        serverLogBuffer.error('[BOOKING] Prisma schema error', {
          requestId,
          error: error.message,
          code: error.code,
        })
        return NextResponse.json(
          {
            ok: false,
            errorCode: 'SCHEMA_MISMATCH',
            message: 'Server database schema is not up to date. Please contact support.',
            requestId,
            ...(isDev && {
              debug: error.message,
              fixCommand: 'Run: npx prisma db push && restart dev server',
            }),
          },
          { status: 500 }
        )
      }
      throw error
    }

    if (!unit) {
      // Get all available units for debug info
      let availableUnits: Array<{ id: string; slug: string; name: string }> = []
      try {
        availableUnits = await prisma.unit.findMany({
          select: { id: true, slug: true, name: true },
        })
      } catch {
        // Ignore error if we can't fetch units
      }

      serverLogBuffer.error('[BOOKING] Unit not found', {
        requestId,
        unitSlug: validated.unitSlug,
        unitId: validated.unitId,
        lookupBy,
        lookupValue,
        availableUnits: availableUnits.map(u => ({ slug: u.slug, id: u.id })),
      })

      return NextResponse.json(
        {
          ok: false,
          errorCode: 'UNIT_NOT_FOUND',
          message: 'The selected unit was not found. Please try again.',
          requestId,
          ...(isDev && {
            debug: {
              received: {
                unitSlug: validated.unitSlug,
                unitId: validated.unitId,
              },
              lookupBy,
              lookupValue,
              availableUnits: availableUnits.map(u => ({ slug: u.slug, name: u.name })),
              fixCommand: 'Run: npm run db:seed',
            },
          }),
        },
        { status: 400 }
      )
    }

    // Parse and normalize dates
    let checkIn: Date | null = validated.checkIn ? new Date(validated.checkIn) : null
    let checkOut: Date | null = validated.checkOut ? new Date(validated.checkOut) : null
    const eventDate: Date | null = validated.eventDate ? new Date(validated.eventDate) : null

    // Normalize 1-night stays: if checkIn exists and checkOut is missing or equal, set checkOut = checkIn + 1 day
    if (unit.type === 'stay' && checkIn) {
      if (!checkOut || checkOut <= checkIn) {
        checkOut = addDays(checkIn, 1)
        serverLogBuffer.info('[BOOKING] Normalized 1-night stay', {
          requestId,
          originalCheckOut: validated.checkOut,
          normalizedCheckOut: checkOut.toISOString().split('T')[0],
        })
      }
    }

    // Validate dates
    if (unit.type === 'stay') {
      if (!checkIn || !checkOut) {
        return NextResponse.json(
          {
            ok: false,
            errorCode: 'VALIDATION',
            message: 'Check-in and check-out dates are required',
            fieldErrors: {
              checkIn: !checkIn ? 'Check-in date is required' : undefined,
              checkOut: !checkOut ? 'Check-out date is required' : undefined,
            },
            requestId,
          },
          { status: 400 }
        )
      }
      if (checkOut <= checkIn) {
        return NextResponse.json(
          {
            ok: false,
            errorCode: 'VALIDATION',
            message: 'Check-out date must be after check-in date',
            fieldErrors: {
              checkOut: 'Check-out must be after check-in',
            },
            requestId,
          },
          { status: 400 }
        )
      }
      if (!validated.guests || parseInt(validated.guests) < 1) {
        return NextResponse.json(
          {
            ok: false,
            errorCode: 'VALIDATION',
            message: 'Number of guests must be at least 1',
            fieldErrors: {
              guests: 'At least 1 guest required',
            },
            requestId,
          },
          { status: 400 }
        )
      }
      if (unit.sleepsUpTo && parseInt(validated.guests) > unit.sleepsUpTo) {
        return NextResponse.json(
          {
            ok: false,
            errorCode: 'VALIDATION',
            message: `Maximum ${unit.sleepsUpTo} guests allowed`,
            fieldErrors: {
              guests: `Maximum ${unit.sleepsUpTo} guests`,
            },
            requestId,
          },
          { status: 400 }
        )
      }
    } else {
      if (!eventDate) {
        return NextResponse.json(
          {
            ok: false,
            errorCode: 'VALIDATION',
            message: 'Event date is required',
            fieldErrors: {
              eventDate: 'Event date is required',
            },
            requestId,
          },
          { status: 400 }
        )
      }
      if (!validated.guests || parseInt(validated.guests) < 1) {
        return NextResponse.json(
          {
            ok: false,
            errorCode: 'VALIDATION',
            message: 'Estimated attendees must be at least 1',
            fieldErrors: {
              guests: 'At least 1 attendee required',
            },
            requestId,
          },
          { status: 400 }
        )
      }
    }

    // Check availability overlap (server-side validation) - includes resource group checks
    const hasOverlap = await checkAvailabilityOverlap(
      unit.id,
      unit.resourceGroup,
      checkIn,
      checkOut,
      eventDate,
      validated.startTime || null,
      validated.endTime || null
    )
    if (hasOverlap) {
      serverLogBuffer.warn('[BOOKING] Availability overlap detected', {
        requestId,
        unitId: unit.id,
        checkIn,
        checkOut,
        eventDate,
      })
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'OVERLAP',
          message: 'Those dates are not available. Please choose different dates.',
          requestId,
        },
        { status: 409 }
      )
    }

    // NOW check rate limit (only after validation and availability pass)
    const ip = getClientIP(request)
    const rateLimit = checkRateLimit(ip, isDev)
    if (!rateLimit.allowed) {
      serverLogBuffer.warn('[BOOKING] Rate limit exceeded', { ip, requestId })
      const headers: Record<string, string> = {}
      if (rateLimit.retryAfter) {
        headers['Retry-After'] = rateLimit.retryAfter.toString()
      }
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'RATE_LIMIT',
          message: rateLimit.message || 'Too many requests. Please try again in a minute.',
          requestId,
          retryAfterSeconds: rateLimit.retryAfter,
        },
        { status: 429, headers }
      )
    }

    // Step 1: Create booking + BlockedDateRange HOLD in transaction (prevents double booking)
    let booking
    try {
      booking = await prisma.$transaction(async (tx) => {
        // Create booking
        const newBooking = await createBookingSafe(tx, {
          unitId: unit.id,
          status: 'pending',
          name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
          guests: validated.guests ? parseInt(validated.guests) : null,
          checkIn: checkIn,
          checkOut: checkOut,
          eventDate: eventDate,
          startTime: validated.startTime || null,
          endTime: validated.endTime || null,
          eventType: validated.eventType || null,
          notes: validated.notes || null,
        })

        // Create BlockedDateRange HOLD immediately to prevent double booking
        // For stays: block checkIn to checkOut
        // For events: block the event date (whole day)
        let blockStart: Date
        let blockEnd: Date

        if (checkIn && checkOut) {
          // Stay: block from checkIn (inclusive) to checkOut (exclusive)
          blockStart = new Date(checkIn)
          blockStart.setHours(0, 0, 0, 0)
          blockEnd = new Date(checkOut)
          blockEnd.setHours(0, 0, 0, 0)
        } else if (eventDate) {
          // Event: block the whole day (safer for resource groups)
          // Time overlap is checked in availability, but we block the full day to prevent conflicts
          blockStart = new Date(eventDate)
          blockStart.setHours(0, 0, 0, 0)
          blockEnd = new Date(eventDate)
          blockEnd.setHours(23, 59, 59, 999)
        } else {
          throw new Error('Invalid booking: no dates provided')
        }

        // Create block for the unit AND resource group (if applicable)
        try {
          await tx.blockedDateRange.create({
            data: {
              unitId: unit.id,
              resourceGroup: unit.resourceGroup || null,
              startDate: blockStart,
              endDate: blockEnd,
              reason: `HOLD: Booking ${newBooking.id} (pending)`,
            },
          })
          serverLogBuffer.info('[BOOKING] Created BlockedDateRange HOLD', {
            requestId,
            bookingId: newBooking.id,
            unitId: unit.id,
            resourceGroup: unit.resourceGroup,
            startDate: blockStart.toISOString(),
            endDate: blockEnd.toISOString(),
          })
        } catch (blockError: any) {
          // If BlockedDateRange creation fails, log but don't fail the booking
          serverLogBuffer.warn('[BOOKING] Failed to create BlockedDateRange HOLD', {
            requestId,
            bookingId: newBooking.id,
            error: blockError?.message,
          })
          // Continue - booking is still created
        }

        return newBooking
      })
    } catch (error: any) {
      if (isPrismaSchemaError(error)) {
        serverLogBuffer.error('[BOOKING] Prisma schema error on booking create', {
          requestId,
          error: error.message,
          code: error.code,
        })
        return NextResponse.json(
          {
            ok: false,
            errorCode: 'SCHEMA_MISMATCH',
            message: 'Server database schema is not up to date. Please contact support.',
            requestId,
            ...(isDev && {
              debug: error.message,
              fixCommand: 'Run: npx prisma db push && restart dev server',
            }),
          },
          { status: 500 }
        )
      }
      // Other Prisma errors (constraints, etc.)
      serverLogBuffer.error('[BOOKING] Failed to create booking', {
        requestId,
        error: error.message,
        stack: error.stack,
        code: error.code,
      })
      throw error
    }

    // Increment rate limit only on successful booking creation
    incrementRateLimit(ip)

    serverLogBuffer.info('[BOOKING] Created booking', {
      requestId,
      bookingId: booking.id,
      unit: unit.name,
      guestEmail: validated.email,
    })

    // Step 2: Attempt notifications via orchestrator
    let notificationSummary
    try {
      notificationSummary = await sendBookingNotifications(booking, false)
    } catch (error: any) {
      serverLogBuffer.error('[BOOKING] Notification orchestrator exception', {
        requestId,
        bookingId: booking.id,
        error: error?.message,
        stack: error?.stack,
      })
      // Fallback to safe defaults
      notificationSummary = {
        guestEmail: 'failed' as const,
        ownerEmail: 'failed' as const,
        ownerSms: 'failed' as const,
        guestSms: 'not_sent' as const,
        warnings: ['NOTIFICATION_SYSTEM_ERROR'],
      }
    }

    // Map to response format
    const notifications = {
      guestEmail: notificationSummary.guestEmail,
      ownerEmail: notificationSummary.ownerEmail,
      ownerSms: notificationSummary.ownerSms,
      guestSms: notificationSummary.guestSms,
    }

    const errors: Record<string, string> = {}
    if (notificationSummary.guestEmail === 'failed') {
      errors.guestEmail = 'Failed to send guest email'
    }
    if (notificationSummary.ownerEmail === 'failed') {
      errors.ownerEmail = 'Failed to send owner email'
    }
    if (notificationSummary.ownerSms === 'failed') {
      errors.ownerSms = 'Failed to send owner SMS'
    }

    // Always return success if booking was created (DB is source of truth)
    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      requestId,
      notifications,
      ...(notificationSummary.warnings.length > 0 && { warnings: [...new Set(notificationSummary.warnings)] }),
      ...(Object.keys(errors).length > 0 && { errors }),
      notificationStatus: {
        guestEmail: notificationSummary.guestEmail,
        ownerEmail: notificationSummary.ownerEmail,
        ownerSms: notificationSummary.ownerSms,
        guestSms: notificationSummary.guestSms,
      },
    })
  } catch (error) {
    // Catch-all for unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    serverLogBuffer.error('[BOOKING] Unexpected error', {
      requestId,
      error: errorMessage,
      stack: errorStack,
    })

    console.error('[BOOKING] Unexpected error:', {
      requestId,
      error,
      stack: errorStack,
    })

    // Check if it's a Prisma schema error
    if (isPrismaSchemaError(error)) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'SCHEMA_MISMATCH',
          message: 'Server database schema is not up to date. Please contact support.',
          requestId,
          ...(isDev && {
            debug: errorMessage,
            fixCommand: 'Run: npx prisma db push && restart dev server',
          }),
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: false,
        errorCode: 'INTERNAL_ERROR',
        message: 'Something went wrong. Please try again later.',
        requestId,
        ...(isDev && {
          debug: errorMessage,
        }),
      },
      { status: 500 }
    )
  } catch (outerError) {
    // Catch-all for any errors in the outer try-catch (including Prisma init errors)
    const errorMessage = outerError instanceof Error ? outerError.message : 'Unknown error'
    const errorStack = outerError instanceof Error ? outerError.stack : undefined
    
    serverLogBuffer.error('[BOOKING] Outer catch-all error', {
      requestId,
      error: errorMessage,
      stack: errorStack,
    })
    
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'INTERNAL_ERROR',
        message: 'Something went wrong. Please try again later.',
        requestId,
        ...(isDev && {
          debug: errorMessage,
          hint: 'This error occurred before the main handler. Check Prisma initialization.',
        }),
      },
      { status: 500 }
    )
  }
}
