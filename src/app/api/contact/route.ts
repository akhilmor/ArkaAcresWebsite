import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import twilio from 'twilio'
import { z } from 'zod'

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
const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  message: z.string().min(1).max(2000),
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

function formatContactMessage(data: z.infer<typeof contactSchema>): string {
  let message = `New Contact Form Submission\n\n`
  message += `Name: ${data.name}\n`
  message += `Email: ${data.email}\n`
  message += `\nMessage:\n${data.message}\n`
  return message
}

function formatSMSMessage(data: z.infer<typeof contactSchema>): string {
  const preview = data.message.length > 100 
    ? data.message.substring(0, 100) + '...' 
    : data.message
  return `New Contact: ${data.name} (${data.email})\n${preview}`
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

    const validated = contactSchema.parse(body)

    // Format messages
    const emailMessage = formatContactMessage(validated)
    const smsMessage = formatSMSMessage(validated)
    const subject = `Contact Form: ${validated.name}`

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

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid form data. Please check all fields.' },
        { status: 400 }
      )
    }

    console.error('Contact API error:', error)
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}

