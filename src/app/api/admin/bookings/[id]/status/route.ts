import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { sendGuestConfirmed } from '@/lib/notify'
import { serverLogBuffer } from '@/lib/serverLogBuffer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    const body = await request.json()
    const { status } = body

    if (!['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get current booking to check previous status
    const currentBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { unit: true },
    })

    if (!currentBooking) {
      return NextResponse.json(
        { ok: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update booking status
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
      include: { unit: true },
    })

    serverLogBuffer.info('[ADMIN] Booking status updated', {
      bookingId: booking.id,
      oldStatus: currentBooking.status,
      newStatus: status,
    })

    // If status changed to "confirmed", send guest confirmation
    if (status === 'confirmed' && currentBooking.status !== 'confirmed') {
      try {
        const result = await sendGuestConfirmed(booking, false)
        serverLogBuffer.info('[ADMIN] Guest confirmation sent', {
          bookingId: booking.id,
          success: result.ok,
        })
      } catch (error: any) {
        serverLogBuffer.error('[ADMIN] Guest confirmation failed', {
          bookingId: booking.id,
          error: error?.message,
        })
      }
    }

    return NextResponse.json({ ok: true, booking })
  } catch (error) {
    serverLogBuffer.error('[ADMIN] Update booking status error', {
      bookingId: params.id,
      error: error instanceof Error ? error.message : 'Unknown',
    })
    console.error('Update booking status error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
