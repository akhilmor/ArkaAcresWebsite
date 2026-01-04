import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyPassword, hashPassword } from '@/lib/adminAuth'
import { ADMIN_EMAIL } from '@/lib/adminConstants'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function checkAuth(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return session?.value === 'authenticated'
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await checkAuth(request)
    if (!authenticated) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { ok: false, error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Trim passwords
    const trimmedCurrent = currentPassword.trim()
    const trimmedNew = newPassword.trim()

    if (trimmedNew.length < 10) {
      return NextResponse.json(
        { ok: false, error: 'New password must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Get admin user (only ADMIN_EMAIL)
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: ADMIN_EMAIL },
    })

    if (!adminUser) {
      return NextResponse.json(
        { ok: false, error: 'Admin user not found' },
        { status: 500 }
      )
    }

    // Verify current password
    const isValid = await verifyPassword(trimmedCurrent, adminUser.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Update password in DB
    const passwordHash = await hashPassword(trimmedNew)
    
    const updated = await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { passwordHash },
    })

    // Safety check: verify the hash works (dev only)
    if (process.env.NODE_ENV === 'development') {
      const verifyTest = await verifyPassword(trimmedNew, updated.passwordHash)
      if (!verifyTest) {
        console.error('[ADMIN CHANGE] CRITICAL: Password hash verification failed after change!')
      } else {
        console.log('[ADMIN CHANGE] Password hash verified successfully')
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to change password' },
      { status: 500 }
    )
  }
}

