import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  sendGuestReceipt,
  sendGuestConfirmed,
  sendOwnerNewRequest,
  sendOwnerSms,
  sendGuestSmsReceipt,
} from '@/lib/notify'
import { serverLogBuffer } from '@/lib/serverLogBuffer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function checkAuth(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return session?.value === 'authenticated'
}

const resendSchema = z.object({
  audience: z.enum(['owner', 'guest']),
  channel: z.enum(['email', 'sms']),
  messageType: z.enum(['guest_receipt', 'guest_confirmed', 'owner_new_request']),
  force: z.boolean().default(false),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authenticated = await checkAuth(request)
    if (!authenticated) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = resendSchema.parse(body)

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { unit: true },
    })

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    let result

    // Route to appropriate notification function
    if (validated.audience === 'guest' && validated.channel === 'email') {
      if (validated.messageType === 'guest_receipt') {
        result = await sendGuestReceipt(booking, validated.force)
      } else if (validated.messageType === 'guest_confirmed') {
        result = await sendGuestConfirmed(booking, validated.force)
      } else {
        return NextResponse.json(
          { ok: false, error: 'Invalid message type for guest email' },
          { status: 400 }
        )
      }
    } else if (validated.audience === 'guest' && validated.channel === 'sms') {
      result = await sendGuestSmsReceipt(booking, validated.force)
    } else if (validated.audience === 'owner' && validated.channel === 'email') {
      result = await sendOwnerNewRequest(booking, validated.force)
    } else if (validated.audience === 'owner' && validated.channel === 'sms') {
      result = await sendOwnerSms(booking, validated.force)
    } else {
      return NextResponse.json(
        { ok: false, error: 'Invalid audience/channel combination' },
        { status: 400 }
      )
    }

    serverLogBuffer.info('[ADMIN] Resend notification', {
      bookingId: booking.id,
      audience: validated.audience,
      channel: validated.channel,
      messageType: validated.messageType,
      force: validated.force,
      success: result.ok,
    })

    return NextResponse.json({
      ok: result.ok,
      result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    serverLogBuffer.error('[ADMIN] Resend notification error', {
      bookingId: params.id,
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return NextResponse.json(
      { ok: false, error: 'Failed to resend notification' },
      { status: 500 }
    )
  }
}

