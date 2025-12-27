import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { sendOwnerSms } from '@/lib/notify'
import { getEnvSafe } from '@/lib/env'

export const runtime = 'nodejs'

async function checkAuth(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return session?.value === 'authenticated'
}


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

    // Get booking
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

    // Resend SMS using the notification system
    const result = await sendOwnerSms(booking, true) // force = true

    if (result.ok) {
      return NextResponse.json({
        ok: true,
        providerMessageId: result.providerMessageId,
      })
    } else {
      return NextResponse.json(
        { ok: false, error: result.error || 'Failed to send SMS' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Resend SMS error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to resend SMS' },
      { status: 500 }
    )
  }
}
