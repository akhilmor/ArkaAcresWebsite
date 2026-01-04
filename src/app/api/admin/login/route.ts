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

    // Enforce ADMIN_EMAIL - only arkaacres@gmail.com can log in
    // Reject if user tries to use a different email (generic error)
    if (email && email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase()) {
      console.error('[ADMIN LOGIN] Invalid email attempt', {
        attemptedEmail: email,
        allowedEmail: ADMIN_EMAIL,
        reason: 'email_mismatch',
      })
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
      console.error('[ADMIN LOGIN] Invalid password attempt', {
        email: ADMIN_EMAIL,
        hasPassword: !!password,
        passwordLength: password?.length,
        reason: 'password_mismatch',
      })
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

    console.log('[ADMIN LOGIN] Successful login', { email: ADMIN_EMAIL })
    return NextResponse.json({ ok: true })
  } catch (error) {
    // Distinguish between missing env vars and other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isEnvVarError = errorMessage.includes('ADMIN_PASSWORD') || errorMessage.includes('environment variable')
    
    if (isEnvVarError) {
      console.error('[ADMIN LOGIN] Configuration error - missing environment variable:', errorMessage)
    } else {
      console.error('[ADMIN LOGIN] Unexpected error:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
    
    // Always return generic error to client (security)
    return NextResponse.json(
      { ok: false, error: 'Invalid credentials' },
      { status: 401 }
    )
  }
}

