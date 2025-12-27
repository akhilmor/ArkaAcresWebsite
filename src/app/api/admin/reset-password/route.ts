import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashToken, hashPassword, verifyPassword } from '@/lib/adminAuth'
import { ADMIN_EMAIL } from '@/lib/adminConstants'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json(
        { ok: false, error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    // Trim and validate password
    const trimmedPassword = newPassword.trim()
    if (trimmedPassword.length < 10) {
      return NextResponse.json(
        { ok: false, error: 'Password must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Hash the provided token
    const tokenHash = hashToken(token)

    // Find admin user with matching token that's not expired AND is ADMIN_EMAIL
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        email: ADMIN_EMAIL, // Enforce ADMIN_EMAIL
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: {
          gt: new Date(), // Not expired
        },
      },
    })

    if (!adminUser) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Update password and clear reset token
    const passwordHash = await hashPassword(trimmedPassword)
    
    const updated = await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: {
        passwordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    })

    // Safety check: verify the hash works (dev only)
    if (process.env.NODE_ENV === 'development') {
      const verifyTest = await verifyPassword(trimmedPassword, updated.passwordHash)
      if (!verifyTest) {
        console.error('[ADMIN RESET] CRITICAL: Password hash verification failed after reset!')
      } else {
        console.log('[ADMIN RESET] Password hash verified successfully')
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}

