import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import twilio from 'twilio'
import { z } from 'zod'
import { STAY_UNITS } from '@/content/siteContent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Rate limiting (simple in-memory store)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3

// Initialize Resend (lazy initialization)
function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

// Initialize Twilio (lazy initialization)
function getTwilioClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return null
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

// Validation schema
const bookingSchema = z.object({
  unitSlug: z.string().min(1),
  unitName: z.string().min(1),
  type: z.enum(['stay', 'event']),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(20).optional(),
  // Stay fields
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  // Event fields
  eventDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  eventType: z.string().optional(),
  // Common fields
  guests: z.string().optional(),
  message: z.string().max(2000).optional(),
  // Honeypot
  honey: z.string().max(0).optional(), // Must be empty
})

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      message: 'Too many requests. Please try again in a minute.',
    }
  }

  record.count++
  return { allowed: true }
}

function formatBookingMessage(data: z.infer<typeof bookingSchema>): string {
  let message = `New Booking Request: ${data.unitName}\n\n`
  message += `Contact Information:\n`
  message += `Name: ${data.name}\n`
  message += `Email: ${data.email}\n`
  if (data.phone) {
    message += `Phone: ${data.phone}\n`
  }
  message += `\n`

  if (data.type === 'stay') {
    message += `Stay Details:\n`
    if (data.checkIn) message += `Check-in: ${data.checkIn}\n`
    if (data.checkOut) message += `Check-out: ${data.checkOut}\n`
    if (data.guests) message += `Guests: ${data.guests}\n`
  } else {
    message += `Event Details:\n`
    if (data.eventDate) message += `Date: ${data.eventDate}\n`
    if (data.startTime && data.endTime) {
      message += `Time: ${data.startTime} - ${data.endTime}\n`
    }
    if (data.eventType) message += `Event Type: ${data.eventType}\n`
    if (data.guests) message += `Estimated Attendees: ${data.guests}\n`
  }

  if (data.message) {
    message += `\nAdditional Notes:\n${data.message}\n`
  }

  return message
}

function formatSMSMessage(data: z.infer<typeof bookingSchema>): string {
  let sms = `New ${data.type === 'stay' ? 'Stay' : 'Event'} Booking: ${data.unitName}\n`
  sms += `${data.name} (${data.email})`
  if (data.phone) sms += ` - ${data.phone}`
  sms += `\n`
  
  if (data.type === 'stay' && data.checkIn && data.checkOut) {
    sms += `${data.checkIn} to ${data.checkOut}, ${data.guests || '?'} guests`
  } else if (data.type === 'event' && data.eventDate) {
    sms += `${data.eventDate}`
    if (data.startTime && data.endTime) {
      sms += ` ${data.startTime}-${data.endTime}`
    }
    if (data.guests) sms += `, ${data.guests} attendees`
  }
  
  return sms
}

async function sendEmail(message: string, subject: string): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.warn('RESEND_API_KEY not set, skipping email')
    return
  }

  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev'
  const toEmail = process.env.EMAIL_TO || 'arkaacres@gmail.com'

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      text: message,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new Error('Failed to send email notification')
  }
}

async function sendSMS(message: string): Promise<void> {
  const twilioClient = getTwilioClient()
  if (!twilioClient) {
    console.warn('Twilio not configured, skipping SMS')
    return
  }

  const fromNumber = process.env.TWILIO_FROM_NUMBER
  const toNumber = process.env.SMS_TO_NUMBER || '+14695369020'

  if (!fromNumber) {
    console.warn('TWILIO_FROM_NUMBER not set, skipping SMS')
    return
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    })
  } catch (error) {
    console.error('Failed to send SMS:', error)
    throw new Error('Failed to send SMS notification')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: rateLimit.message },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    // Honeypot check
    if (body.honey && body.honey.length > 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request' },
        { status: 400 }
      )
    }

    const validated = bookingSchema.parse(body)

    // Find unit for additional validation
    const unit = STAY_UNITS.find((u) => u.slug === validated.unitSlug)
    if (!unit) {
      return NextResponse.json(
        { ok: false, error: 'Invalid unit' },
        { status: 400 }
      )
    }

    // Additional validation
    if (validated.type === 'stay') {
      if (!validated.checkIn || !validated.checkOut) {
        return NextResponse.json(
          { ok: false, error: 'Check-in and check-out dates are required' },
          { status: 400 }
        )
      }
      if (new Date(validated.checkOut) <= new Date(validated.checkIn)) {
        return NextResponse.json(
          { ok: false, error: 'Check-out date must be after check-in date' },
          { status: 400 }
        )
      }
      if (!validated.guests || parseInt(validated.guests) < 1) {
        return NextResponse.json(
          { ok: false, error: 'Number of guests must be at least 1' },
          { status: 400 }
        )
      }
      if (unit.sleepsUpTo && parseInt(validated.guests) > unit.sleepsUpTo) {
        return NextResponse.json(
          { ok: false, error: `Maximum ${unit.sleepsUpTo} guests allowed` },
          { status: 400 }
        )
      }
    } else {
      if (!validated.eventDate) {
        return NextResponse.json(
          { ok: false, error: 'Event date is required' },
          { status: 400 }
        )
      }
      if (!validated.startTime || !validated.endTime) {
        return NextResponse.json(
          { ok: false, error: 'Start and end times are required' },
          { status: 400 }
        )
      }
      if (validated.endTime <= validated.startTime) {
        return NextResponse.json(
          { ok: false, error: 'End time must be after start time' },
          { status: 400 }
        )
      }
      if (!validated.guests || parseInt(validated.guests) < 1) {
        return NextResponse.json(
          { ok: false, error: 'Estimated attendees must be at least 1' },
          { status: 400 }
        )
      }
      if (!validated.phone) {
        return NextResponse.json(
          { ok: false, error: 'Phone number is required for events' },
          { status: 400 }
        )
      }
    }

    // Format messages
    const emailMessage = formatBookingMessage(validated)
    const smsMessage = formatSMSMessage(validated)
    const subject = `Booking Request: ${validated.unitName}`

    // Send email and SMS (don't fail if one fails, but log errors)
    const errors: string[] = []
    
    try {
      await sendEmail(emailMessage, subject)
    } catch (error) {
      errors.push('Email failed')
      console.error('Email error:', error)
    }

    try {
      await sendSMS(smsMessage)
    } catch (error) {
      errors.push('SMS failed')
      console.error('SMS error:', error)
    }

    // If both failed, return error
    if (errors.length === 2) {
      return NextResponse.json(
        { ok: false, error: 'Failed to send notifications. Please try again later.' },
        { status: 500 }
      )
    }

    // Store in localStorage on client side (handled by client)
    // We don't store server-side to keep it simple

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid form data. Please check all fields.' },
        { status: 400 }
      )
    }

    console.error('Booking API error:', error)
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}

