import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getEnvSafe } from '@/lib/env'

export const runtime = 'nodejs'

async function checkNotificationLogTable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM NotificationLog LIMIT 1`
    return true
  } catch (error: any) {
    // Table doesn't exist or other error
    return false
  }
}

async function checkBookingColumnsReady(): Promise<boolean> {
  try {
    // Try to query with the new columns
    await prisma.booking.findFirst({
      select: {
        id: true,
        ownerEmailStatus: true,
        ownerSmsStatus: true,
        guestEmailStatus: true,
        guestSmsStatus: true,
      },
    })
    return true
  } catch (error: any) {
    // Columns don't exist
    if (error.message?.includes('ownerEmailStatus') || error.message?.includes('no such column')) {
      return false
    }
    // Other error, assume ready
    return true
  }
}

// Check if Prisma client is available
function checkPrismaClient(): boolean {
  try {
    require.resolve('@prisma/client')
    return true
  } catch {
    return false
  }
}

export async function GET() {
  try {
    const prismaClientOk = checkPrismaClient()
    
    // Test database connection (only if Prisma client exists)
    let dbOk = false
    if (prismaClientOk) {
      try {
        await prisma.unit.findFirst()
        dbOk = true
      } catch (error) {
        console.error('[HEALTH] Database check failed:', error)
      }
    } else {
      console.error('[HEALTH] Prisma client not found')
    }

    const env = getEnvSafe()

    // Check Resend configuration
    const resendConfigured = !!env.RESEND_API_KEY
    const emailFromConfigured = !!env.EMAIL_FROM

    // Check SMTP configuration
    const smtpConfigured = !!(
      env.SMTP_HOST &&
      env.SMTP_PORT &&
      env.SMTP_USER &&
      env.SMTP_PASS
    )

    // Determine email provider
    let emailProvider: 'resend' | 'smtp' | 'none' = 'none'
    if (resendConfigured) {
      emailProvider = 'resend'
    } else if (smtpConfigured) {
      emailProvider = 'smtp'
    }

    // Check Twilio configuration
    const twilioConfigured =
      !!env.TWILIO_ACCOUNT_SID &&
      !!env.TWILIO_AUTH_TOKEN &&
      !!env.TWILIO_FROM_NUMBER

    const twilioFromNumber = env.TWILIO_FROM_NUMBER
    const twilioFromConfigured = !!twilioFromNumber
    const twilioFromNumberValid = twilioFromNumber
      ? twilioFromNumber.startsWith('+')
      : false

    // Check NotificationLog table
    const notificationLogReady = await checkNotificationLogTable()

    // Check Booking columns
    const bookingColumnsReady = await checkBookingColumnsReady()

    // Mask phone number (last 2 digits)
    const maskedFrom = twilioFromNumber
      ? `${twilioFromNumber.slice(0, -2)}**`
      : null

    return NextResponse.json({
      db: dbOk ? 'ok' : 'fail',
      prismaClient: prismaClientOk ? 'ok' : 'missing',
      bookingColumnsReady: prismaClientOk ? bookingColumnsReady : false,
      notificationLogReady: prismaClientOk ? notificationLogReady : false,
      emailProvider,
      resendConfigured,
      smtpConfigured,
      emailFromConfigured,
      twilioConfigured,
      twilioFromConfigured,
      twilioFromNumberValid,
      twilioFromNumber: maskedFrom,
      guestSmsEnabled: env.ENABLE_GUEST_SMS,
      runtime: {
        nodeEnv: env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error('[HEALTH] Health check failed:', error)
      const prismaClientOk = checkPrismaClient()
      return NextResponse.json(
      {
        db: 'fail',
        prismaClient: prismaClientOk ? 'ok' : 'missing',
        bookingColumnsReady: false,
        notificationLogReady: false,
        emailProvider: 'none',
        resendConfigured: false,
        smtpConfigured: false,
        emailFromConfigured: false,
        twilioConfigured: false,
        twilioFromConfigured: false,
        twilioFromNumberValid: false,
        guestSmsEnabled: false,
        runtime: {
          nodeEnv: process.env.NODE_ENV || 'unknown',
        },
        error: 'Health check failed',
      },
      { status: 500 }
    )
  }
}
