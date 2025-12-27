import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import {
  sendOwnerNewRequest,
  sendGuestReceipt,
  sendGuestConfirmed,
  sendOwnerSms,
} from '@/lib/notify'
import { serverLogBuffer } from '@/lib/serverLogBuffer'

export const runtime = 'nodejs'

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

    const body = await request.json()
    const { bookingId, audience, channel, messageType, force = true } = body

    if (!bookingId || !audience || !channel || !messageType) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: bookingId, audience, channel, messageType' },
        { status: 400 }
      )
    }

    // Get booking with unit
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        unit: {
          select: {
            name: true,
            slug: true,
            type: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Route to appropriate notification function
    let result
    if (channel === 'email') {
      if (audience === 'owner' && messageType === 'owner_new_request') {
        result = await sendOwnerNewRequest(booking, force)
      } else if (audience === 'guest' && messageType === 'guest_receipt') {
        result = await sendGuestReceipt(booking, force)
      } else if (audience === 'guest' && messageType === 'guest_confirmed') {
        result = await sendGuestConfirmed(booking, force)
      } else {
        return NextResponse.json(
          { ok: false, error: `Invalid messageType for email: ${messageType}` },
          { status: 400 }
        )
      }
    } else if (channel === 'sms') {
      if (audience === 'owner' && messageType === 'owner_new_request') {
        result = await sendOwnerSms(booking, force)
      } else {
        return NextResponse.json(
          { ok: false, error: `SMS not supported for ${audience}/${messageType}` },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { ok: false, error: `Invalid channel: ${channel}` },
        { status: 400 }
      )
    }

    serverLogBuffer.info('[ADMIN] Resend notification', {
      bookingId,
      audience,
      channel,
      messageType,
      success: result.ok,
      error: result.error,
    })

    if (result.ok) {
      return NextResponse.json({
        ok: true,
        providerMessageId: result.providerMessageId,
        logId: result.logId,
      })
    } else {
      return NextResponse.json(
        {
          ok: false,
          error: result.error || 'Failed to send notification',
          logId: result.logId,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    serverLogBuffer.error('[ADMIN] Resend notification error', {
      error: error?.message,
      stack: error?.stack,
    })
    return NextResponse.json(
      { ok: false, error: 'Failed to resend notification' },
      { status: 500 }
    )
  }
}

