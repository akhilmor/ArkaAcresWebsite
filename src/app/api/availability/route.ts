import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const unitSlug = searchParams.get('unitSlug')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!unitSlug || !from || !to) {
      return NextResponse.json(
        { ok: false, error: 'Missing required parameters: unitSlug, from, to' },
        { status: 400 }
      )
    }

    // Find unit
    const unit = await prisma.unit.findUnique({
      where: { slug: unitSlug },
    })

    if (!unit) {
      return NextResponse.json(
        { ok: false, error: 'Unit not found' },
        { status: 404 }
      )
    }

    const fromDate = new Date(from)
    const toDate = new Date(to)

    // Get all bookings (pending or confirmed block availability)
    // Also check bookings for other units in the same resource group
    let unitIdsToCheck = [unit.id]
    if (unit.resourceGroup) {
      const groupUnits = await prisma.unit.findMany({
        where: { resourceGroup: unit.resourceGroup },
        select: { id: true },
      })
      unitIdsToCheck = groupUnits.map(u => u.id)
    }

    const bookings = await prisma.booking.findMany({
      where: {
        unitId: { in: unitIdsToCheck },
        status: {
          in: ['pending', 'confirmed'],
        },
        OR: [
          // Stay bookings: checkIn/checkOut overlap
          {
            AND: [
              { checkIn: { not: null } },
              { checkOut: { not: null } },
              { checkIn: { lt: toDate } },
              { checkOut: { gt: fromDate } },
            ],
          },
          // Event bookings: eventDate within range
          {
            AND: [
              { eventDate: { not: null } },
              { eventDate: { gte: fromDate } },
              { eventDate: { lte: toDate } },
            ],
          },
        ],
      },
      select: {
        checkIn: true,
        checkOut: true,
        eventDate: true,
        status: true,
      },
    })

    // Get all blocked date ranges (by unitId OR resourceGroup)
    const blockedRanges = await prisma.blockedDateRange.findMany({
      where: {
        OR: [
          { unitId: unit.id },
          ...(unit.resourceGroup ? [{ resourceGroup: unit.resourceGroup }] : []),
        ],
        startDate: { lt: toDate },
        endDate: { gt: fromDate },
      },
      select: {
        startDate: true,
        endDate: true,
        reason: true,
      },
    })

    // Calculate disabled dates
    const disabledDates: Date[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Add all dates from bookings
    bookings.forEach((booking) => {
      if (booking.checkIn && booking.checkOut) {
        // Stay booking: block all dates from checkIn (inclusive) to checkOut (exclusive)
        const checkIn = new Date(booking.checkIn)
        const checkOut = new Date(booking.checkOut)
        checkIn.setHours(0, 0, 0, 0)
        checkOut.setHours(0, 0, 0, 0)

        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          const date = new Date(d)
          if (date >= fromDate && date < toDate && !disabledDates.some((dd) => dd.getTime() === date.getTime())) {
            disabledDates.push(date)
          }
        }
      } else if (booking.eventDate) {
        // Event booking: block the event date
        const eventDate = new Date(booking.eventDate)
        eventDate.setHours(0, 0, 0, 0)
        if (eventDate >= fromDate && eventDate < toDate && !disabledDates.some((dd) => dd.getTime() === eventDate.getTime())) {
          disabledDates.push(eventDate)
        }
      }
    })

    // Add all dates from blocked ranges
    blockedRanges.forEach((block) => {
      const start = new Date(block.startDate)
      const end = new Date(block.endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const date = new Date(d)
        if (date >= fromDate && date < toDate && !disabledDates.some((dd) => dd.getTime() === date.getTime())) {
          disabledDates.push(date)
        }
      }
    })

    // Also disable past dates
    for (let d = new Date(fromDate); d < today; d.setDate(d.getDate() + 1)) {
      const date = new Date(d)
      if (!disabledDates.some((dd) => dd.getTime() === date.getTime())) {
        disabledDates.push(date)
      }
    }

    return NextResponse.json({
      ok: true,
      disabledDates: disabledDates.map((d) => d.toISOString().split('T')[0]),
      bookings: bookings.map((b) => ({
        checkIn: b.checkIn?.toISOString(),
        checkOut: b.checkOut?.toISOString(),
        eventDate: b.eventDate?.toISOString(),
        status: b.status,
      })),
      blockedRanges: blockedRanges.map((b) => ({
        startDate: b.startDate.toISOString(),
        endDate: b.endDate.toISOString(),
        reason: b.reason,
      })),
    })
  } catch (error) {
    console.error('Availability API error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

