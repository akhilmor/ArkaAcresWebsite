import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function checkAuth(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return session?.value === 'authenticated'
}

const blockSchema = z.object({
  unitSlug: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const authenticated = await checkAuth(request)
    if (!authenticated) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const blocks = await prisma.blockedDateRange.findMany({
      include: {
        unit: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    })

    return NextResponse.json({
      ok: true,
      blocks: blocks.map((b) => ({
        id: b.id,
        unit: b.unit,
        startDate: b.startDate.toISOString(),
        endDate: b.endDate.toISOString(),
        reason: b.reason,
      })),
    })
  } catch (error) {
    console.error('Get blocks error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch blocks' },
      { status: 500 }
    )
  }
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
    const validated = blockSchema.parse(body)

    // Find unit
    const unit = await prisma.unit.findUnique({
      where: { slug: validated.unitSlug },
    })

    if (!unit) {
      return NextResponse.json(
        { ok: false, error: 'Unit not found' },
        { status: 404 }
      )
    }

    const startDate = new Date(validated.startDate)
    const endDate = new Date(validated.endDate)

    if (endDate < startDate) {
      return NextResponse.json(
        { ok: false, error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Optional: Check for overlapping blocks (recommended)
    const overlappingBlock = await prisma.blockedDateRange.findFirst({
      where: {
        unitId: unit.id,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    })

    if (overlappingBlock) {
      return NextResponse.json(
        { ok: false, error: 'This date range overlaps with an existing block' },
        { status: 400 }
      )
    }

    const block = await prisma.blockedDateRange.create({
      data: {
        unitId: unit.id,
        startDate,
        endDate,
        reason: validated.reason || null,
      },
    })

    return NextResponse.json({ ok: true, block })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid form data' },
        { status: 400 }
      )
    }

    console.error('Create block error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to create block' },
      { status: 500 }
    )
  }
}

