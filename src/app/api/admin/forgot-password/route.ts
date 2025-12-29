import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdminUser } from '@/lib/ensureAdminUser'
import { generateResetToken } from '@/lib/adminAuth'
import { sendEmail } from '@/lib/notifications/email'
import { ADMIN_EMAIL } from '@/lib/adminConstants'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      // Always return ok:true to prevent enumeration
      return NextResponse.json({ ok: true })
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Always return ok:true to prevent email enumeration
    // Only proceed if email matches ADMIN_EMAIL exactly
    if (normalizedEmail !== ADMIN_EMAIL.toLowerCase()) {
      // Still return success, but don't send email
      return NextResponse.json({ ok: true })
    }

    // Ensure admin user exists (bootstrap from env if needed - only creates if missing)
    await ensureAdminUser()

    // Generate reset token
    const { token, tokenHash } = generateResetToken()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // Update admin user with reset token (only for ADMIN_EMAIL)
    await prisma.adminUser.update({
      where: { email: ADMIN_EMAIL },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: expiresAt,
      },
    })

    // Build reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '')
    if (!appUrl) {
      console.error('NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL must be set in production')
      return NextResponse.json({ ok: true, error: 'Configuration error' }, { status: 500 })
    }
    const resetUrl = `${appUrl}/admin/reset-password?token=${token}`

    // Send reset email
    const emailResult = await sendEmail({
      to: ADMIN_EMAIL,
      subject: 'Reset Your Arka Acres Admin Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { background: #C0552F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset Your Admin Password</h1>
            <p>You requested to reset your admin password for Arka Acres.</p>
            <p>Click the button below to reset your password (link expires in 30 minutes):</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <div class="footer">
              <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Reset Your Admin Password

You requested to reset your admin password for Arka Acres.

Click this link to reset your password (expires in 30 minutes):
${resetUrl}

If you didn't request this, you can safely ignore this email.
      `.trim(),
    })

    // In development, always include devResetUrl if email failed or not configured
    const response: any = { ok: true }
    
    if (process.env.NODE_ENV === 'development') {
      if (!emailResult.ok || emailResult.errorCode === 'NO_EMAIL_PROVIDER_CONFIGURED') {
        response.devResetUrl = resetUrl
        response.devMessage = 'Email provider not configured. Use this link to reset:'
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Forgot password error:', error)
    // Still return ok:true to prevent enumeration
    return NextResponse.json({ ok: true })
  }
}

