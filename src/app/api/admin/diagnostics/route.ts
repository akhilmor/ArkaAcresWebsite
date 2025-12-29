import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { serverLogBuffer } from '@/lib/serverLogBuffer'
import { getEnvSafe } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function checkAuth(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return session?.value === 'authenticated'
}

export async function GET(request: NextRequest) {
  try {
    const authenticated = await checkAuth(request)
    if (!authenticated) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get latest bookings
    const latestBookings = await prisma.booking.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        unit: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    // Get latest notification logs
    const latestNotifications = await prisma.notificationLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        bookingId: true,
        audience: true,
        channel: true,
        messageType: true,
        status: true,
        provider: true,
        providerMessageId: true,
        errorMessage: true,
        createdAt: true,
      },
    })

    // Get server logs
    const logs = serverLogBuffer.getLogs(200)

    // Get env check (no secrets) with provider status
    const env = getEnvSafe()
    const envCheck: Record<string, any> = {
      DATABASE_URL: !!env.DATABASE_URL,
      RESEND_API_KEY: !!env.RESEND_API_KEY,
      EMAIL_FROM: !!env.EMAIL_FROM,
      SMTP_HOST: !!env.SMTP_HOST,
      SMTP_PORT: !!env.SMTP_PORT,
      SMTP_USER: !!env.SMTP_USER,
      SMTP_PASS: !!env.SMTP_PASS ? '***' : false, // Mask password
      TWILIO_ACCOUNT_SID: !!env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: !!env.TWILIO_AUTH_TOKEN ? '***' : false, // Mask token
      TWILIO_FROM_NUMBER: !!env.TWILIO_FROM_NUMBER,
      SMS_TO_NUMBER: !!env.SMS_TO_NUMBER,
      ADMIN_PASSWORD: !!env.ADMIN_PASSWORD ? '***' : false, // Mask password
      ENABLE_GUEST_SMS: env.ENABLE_GUEST_SMS,
      NODE_ENV: env.NODE_ENV,
    }
    
    // Add provider status if available
    if ('hasResend' in env) {
      envCheck.hasResend = (env as any).hasResend
      envCheck.hasSmtp = (env as any).hasSmtp
      envCheck.hasEmailProvider = (env as any).hasEmailProvider
      envCheck.hasTwilio = (env as any).hasTwilio
    }

    return NextResponse.json({
      ok: true,
      bookings: latestBookings.map((b: any) => ({
        id: b.id,
        unit: b.unit,
        status: b.status,
        name: b.name,
        email: b.email,
        createdAt: b.createdAt.toISOString(),
        ownerEmailStatus: b.ownerEmailStatus || 'not_sent',
        ownerSmsStatus: b.ownerSmsStatus || 'not_sent',
        guestEmailStatus: b.guestEmailStatus || 'not_sent',
        guestSmsStatus: b.guestSmsStatus || 'not_sent',
        lastNotificationError: b.lastNotificationError || null,
      })),
      notifications: latestNotifications,
      logs,
      envCheck,
    })
  } catch (error) {
    console.error('[DIAGNOSTICS] Error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch diagnostics' },
      { status: 500 }
    )
  }
}

