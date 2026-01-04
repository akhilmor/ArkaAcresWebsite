import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    const bookings = await prisma.booking.findMany({
      include: {
        unit: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      ok: true,
      bookings: bookings.map((b: any) => ({
        id: b.id,
        unit: b.unit,
        status: b.status,
        name: b.name,
        email: b.email,
        phone: b.phone,
        guests: b.guests,
        checkIn: b.checkIn?.toISOString() || null,
        checkOut: b.checkOut?.toISOString() || null,
        eventDate: b.eventDate?.toISOString() || null,
        startTime: b.startTime,
        endTime: b.endTime,
        eventType: b.eventType,
        notes: b.notes,
        createdAt: b.createdAt.toISOString(),
        // Use new field names if available, fallback to old or default
        ownerEmailStatus: b.ownerEmailStatus || b.emailStatus || 'not_sent',
        ownerSmsStatus: b.ownerSmsStatus || b.smsStatus || 'not_sent',
        guestEmailStatus: b.guestEmailStatus || 'not_sent',
        guestSmsStatus: b.guestSmsStatus || 'not_sent',
        lastNotificationError: b.lastNotificationError || b.emailError || b.smsError || null,
      })),
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

