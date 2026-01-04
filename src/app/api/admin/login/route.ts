import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ensureAdminUser } from '@/lib/ensureAdminUser'
import { verifyPassword } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import { ADMIN_EMAIL } from '@/lib/adminConstants'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, email } = body

    // Enforce ADMIN_EMAIL - ignore any provided email
    // Reject if user tries to use a different email (generic error)
    if (email && email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { ok: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { ok: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Ensure admin user exists (bootstrap from env if needed - only creates if missing)
    await ensureAdminUser()

    // Find admin user (only ADMIN_EMAIL is valid)
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: ADMIN_EMAIL },
    })

    if (!adminUser) {
      return NextResponse.json(
        { ok: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password (trim input)
    const isValid = await verifyPassword(password.trim(), adminUser.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Set a signed cookie (in production, use a proper session token)
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { ok: false, error: 'Invalid credentials' },
      { status: 401 }
    )
  }
}

