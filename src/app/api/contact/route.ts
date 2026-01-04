import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '@/lib/notifications/email'
import { getEnvSafe } from '@/lib/env'
import twilio from 'twilio'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Rate limiting (simple in-memory store)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3

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

function formatContactEmailHtml(data: z.infer<typeof contactSchema>): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #C0552F; color: white; padding: 20px; border-radius: 6px 6px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 6px 6px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: 600; color: #3E362C; }
        .value { margin-top: 5px; color: #5C5244; }
        .message-box { background: white; padding: 15px; border-left: 3px solid #C0552F; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">New Contact Form Submission</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${data.name}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `.trim()
}

function formatContactEmailText(data: z.infer<typeof contactSchema>): string {
  let message = `New Contact Form Submission\n\n`
  message += `Name: ${data.name}\n`
  message += `Email: ${data.email}\n`
  message += `\nMessage:\n${data.message}\n`
  return message
}

function formatUserConfirmationEmailHtml(data: z.infer<typeof contactSchema>): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #C0552F; color: white; padding: 20px; border-radius: 6px 6px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 6px 6px; }
        .message { background: white; padding: 15px; border-left: 3px solid #C0552F; margin: 15px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Thank You for Contacting Arka Acres</h1>
        </div>
        <div class="content">
          <p>Hi ${data.name},</p>
          <p>We received your message and will get back to you as soon as possible. We typically respond within 24 hours.</p>
          <div class="message">
            <strong>Your message:</strong><br>
            ${data.message.replace(/\n/g, '<br>')}
          </div>
          <p>If you have any urgent questions, feel free to call us at <a href="tel:+14695369018">(469) 536-9018</a>.</p>
          <p>Thank you for your interest in Arka Acres!</p>
          <div class="footer">
            <p>Arka Acres<br>
            A peaceful farm where we care for the land, animals, and each other.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `.trim()
}

function formatUserConfirmationEmailText(data: z.infer<typeof contactSchema>): string {
  let message = `Thank You for Contacting Arka Acres\n\n`
  message += `Hi ${data.name},\n\n`
  message += `We received your message and will get back to you as soon as possible. We typically respond within 24 hours.\n\n`
  message += `Your message:\n${data.message}\n\n`
  message += `If you have any urgent questions, feel free to call us at (469) 536-9018.\n\n`
  message += `Thank you for your interest in Arka Acres!\n\n`
  message += `Arka Acres\n`
  message += `A peaceful farm where we care for the land, animals, and each other.\n`
  return message
}

function formatSMSMessage(data: z.infer<typeof contactSchema>): string {
  const preview = data.message.length > 100 
    ? data.message.substring(0, 100) + '...' 
    : data.message
  return `New Contact: ${data.name} (${data.email})\n${preview}`
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

    // Get owner email from env
    const env = getEnvSafe()
    const ownerEmail = env.OWNER_EMAIL || 'arkaacres@gmail.com'

    // Format messages
    const ownerEmailHtml = formatContactEmailHtml(validated)
    const ownerEmailText = formatContactEmailText(validated)
    const userConfirmationHtml = formatUserConfirmationEmailHtml(validated)
    const userConfirmationText = formatUserConfirmationEmailText(validated)
    const smsMessage = formatSMSMessage(validated)
    const ownerSubject = `Contact Form: ${validated.name}`
    const userSubject = `We received your message - Arka Acres`

    // Send email to owner using existing email system (has SMTP fallback)
    const ownerEmailResult = await sendEmail({
      to: ownerEmail,
      subject: ownerSubject,
      html: ownerEmailHtml,
      text: ownerEmailText,
      replyTo: validated.email,
    })

    // Send confirmation email to user
    const userEmailResult = await sendEmail({
      to: validated.email,
      subject: userSubject,
      html: userConfirmationHtml,
      text: userConfirmationText,
    })

    // Send SMS if configured (optional, don't fail if it fails)
    let smsSent = false
    try {
      await sendSMS(smsMessage)
      smsSent = true
    } catch (error) {
      console.warn('SMS failed (optional):', error)
    }

    // If owner email failed, return error (user confirmation is nice-to-have)
    if (!ownerEmailResult.ok) {
      return NextResponse.json(
        { ok: false, error: 'Something went wrong. Please try again later.' },
        { status: 500 }
      )
    }

    // Log if user confirmation failed (but don't fail the request)
    if (!userEmailResult.ok) {
      console.warn('[CONTACT] User confirmation email failed', {
        email: validated.email,
        error: userEmailResult.error,
      })
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

