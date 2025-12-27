import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { sendOwnerNewRequest, sendGuestReceipt, sendGuestConfirmed } from '@/lib/notify'

export const runtime = 'nodejs'

async function checkAuth(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return session?.value === 'authenticated'
}

// Safe update - only updates fields that exist
async function updateBookingStatusSafe(
  bookingId: string,
  data: Record<string, any>
): Promise<void> {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data,
    })
  } catch (error: any) {
    // If columns don't exist, try with only ownerEmailStatus fields
    if (error?.message?.includes('emailStatus') || error?.message?.includes('no such column')) {
      const safeData: Record<string, any> = {}
      if (data.ownerEmailStatus !== undefined) safeData.ownerEmailStatus = data.ownerEmailStatus
      if (data.ownerSmsStatus !== undefined) safeData.ownerSmsStatus = data.ownerSmsStatus
      if (data.lastNotificationError !== undefined) safeData.lastNotificationError = data.lastNotificationError
      
      if (Object.keys(safeData).length > 0) {
        try {
          await prisma.booking.update({
            where: { id: bookingId },
            data: safeData,
          })
        } catch {
          // If that also fails, just skip the update
          console.warn('[RESEND EMAIL] Could not update booking status fields', { bookingId })
        }
      }
    } else {
      throw error
    }
  }
}

// Lazy initialization
function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  const { Resend } = require('resend')
  return new Resend(process.env.RESEND_API_KEY)
}

function formatBookingMessage(booking: any, unitName: string): string {
  let message = `New Booking Request: ${unitName}\n\n`
  message += `Booking ID: ${booking.id}\n\n`
  message += `Contact Information:\n`
  message += `Name: ${booking.name}\n`
  message += `Email: ${booking.email}\n`
  if (booking.phone) {
    message += `Phone: ${booking.phone}\n`
  }
  message += `\n`

  if (booking.checkIn && booking.checkOut) {
    message += `Stay Details:\n`
    message += `Check-in: ${booking.checkIn}\n`
    message += `Check-out: ${booking.checkOut}\n`
    if (booking.guests) {
      message += `Guests: ${booking.guests}\n`
    }
  } else if (booking.eventDate) {
    message += `Event Details:\n`
    message += `Date: ${booking.eventDate}\n`
    if (booking.startTime && booking.endTime) {
      message += `Time: ${booking.startTime} - ${booking.endTime}\n`
    }
    if (booking.eventType) {
      message += `Event Type: ${booking.eventType}\n`
    }
    if (booking.guests) {
      message += `Estimated Attendees: ${booking.guests}\n`
    }
  }

  if (booking.notes) {
    message += `\nAdditional Notes:\n${booking.notes}\n`
  }

  return message
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
    const { audience, messageType } = body

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

    // Resend notification using the notification system
    let result
    if (audience === 'owner' && messageType === 'owner_new_request') {
      result = await sendOwnerNewRequest(booking, true) // force = true
    } else if (audience === 'guest' && messageType === 'guest_receipt') {
      result = await sendGuestReceipt(booking, true)
    } else if (audience === 'guest' && messageType === 'guest_confirmed') {
      result = await sendGuestConfirmed(booking, true)
    } else {
      return NextResponse.json(
        { ok: false, error: 'Invalid audience or messageType' },
        { status: 400 }
      )
    }

    if (result.ok) {
      return NextResponse.json({
        ok: true,
        providerMessageId: result.providerMessageId,
      })
    } else {
      return NextResponse.json(
        { ok: false, error: result.error || 'Failed to send notification' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Resend email error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to resend email' },
      { status: 500 }
    )
  }
}
