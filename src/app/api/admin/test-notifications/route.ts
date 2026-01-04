import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sendEmailResend } from '@/lib/notify/email'
import { sendSmsTwilio } from '@/lib/notify/sms'
import { VISIT_CONFIG } from '@/content/siteContent'
import { getEnvSafe } from '@/lib/env'
import { serverLogBuffer } from '@/lib/serverLogBuffer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function checkAuth(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return session?.value === 'authenticated'
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = await checkAuth(request)
    if (!authenticated) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const env = getEnvSafe()

    const results: Record<string, any> = {}

    // Test email
    try {
      const emailResult = await sendEmailResend(
        VISIT_CONFIG.emailTo,
        'Test Email — Arka Acres',
        '<h1>Test Email</h1><p>This is a test email from the Arka Acres booking system.</p>',
        'Test Email\n\nThis is a test email from the Arka Acres booking system.'
      )
      results.email = {
        ok: emailResult.ok,
        providerMessageId: emailResult.providerMessageId,
        error: emailResult.error,
      }
    } catch (error: any) {
      results.email = {
        ok: false,
        error: error?.message || 'Unknown error',
      }
    }

    // Test SMS
    try {
      const smsResult = await sendSmsTwilio(
        VISIT_CONFIG.smsTo,
        'Test SMS from Arka Acres booking system'
      )
      results.sms = {
        ok: smsResult.ok,
        providerMessageId: smsResult.providerMessageId,
        error: smsResult.error,
      }
    } catch (error: any) {
      results.sms = {
        ok: false,
        error: error?.message || 'Unknown error',
      }
    }

    serverLogBuffer.info('[ADMIN] Test notifications sent', results)

    return NextResponse.json({
      ok: true,
      results,
      config: {
        emailTo: VISIT_CONFIG.emailTo,
        smsTo: VISIT_CONFIG.smsTo,
        emailFrom: env.EMAIL_FROM || 'not set',
        twilioFrom: env.TWILIO_FROM_NUMBER || 'not set',
      },
    })
  } catch (error) {
    serverLogBuffer.error('[ADMIN] Test notifications error', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return NextResponse.json(
      { ok: false, error: 'Failed to send test notifications' },
      { status: 500 }
    )
  }
}

