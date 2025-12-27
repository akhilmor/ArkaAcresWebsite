import { getEnvSafe } from '@/lib/env'
import { serverLogBuffer } from '@/lib/serverLogBuffer'

interface SendEmailResult {
  ok: boolean
  providerMessageId?: string
  error?: string
  provider?: 'resend' | 'smtp' | 'none'
}

// SMTP fallback using nodemailer
async function sendEmailSmtp(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<SendEmailResult> {
  const env = getEnvSafe()

  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    const error = 'SMTP_NOT_CONFIGURED'
    serverLogBuffer.error('[EMAIL] SMTP not configured', { to, subject })
    return { ok: false, error, provider: 'smtp' }
  }

  try {
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT || '587'),
      secure: env.SMTP_SECURE === true, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })

    const info = await transporter.sendMail({
      from: env.EMAIL_FROM || env.SMTP_USER,
      to,
      subject,
      html,
      text,
    })

    const providerMessageId = info.messageId || 'unknown'
    serverLogBuffer.info('[EMAIL] Sent via SMTP', {
      to,
      subject,
      providerMessageId,
    })

    return { ok: true, providerMessageId, provider: 'smtp' }
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error'
    serverLogBuffer.error('[EMAIL] SMTP send failed', {
      to,
      subject,
      error: errorMessage,
      stack: error?.stack,
    })

    return { ok: false, error: errorMessage, provider: 'smtp' }
  }
}

export async function sendEmailResend(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<SendEmailResult> {
  const env = getEnvSafe()

  // Try Resend first
  if (env.RESEND_API_KEY && env.EMAIL_FROM) {
    try {
      const { Resend } = require('resend')
      const resend = new Resend(env.RESEND_API_KEY)

      const result = await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        text,
      })

      const providerMessageId = result.data?.id || 'unknown'
      serverLogBuffer.info('[EMAIL] Sent via Resend', {
        to,
        subject,
        providerMessageId,
      })

      return { ok: true, providerMessageId, provider: 'resend' }
    } catch (error: any) {
      serverLogBuffer.warn('[EMAIL] Resend failed, trying SMTP fallback', {
        to,
        subject,
        error: error?.message,
      })
      // Fall through to SMTP
    }
  } else {
    serverLogBuffer.warn('[EMAIL] Resend not configured, trying SMTP fallback', {
      to,
      subject,
    })
  }

  // Fallback to SMTP
  const smtpResult = await sendEmailSmtp(to, subject, html, text)
  if (smtpResult.ok) {
    return smtpResult
  }

  // Both failed - check if we actually have a provider configured
  if (!env.RESEND_API_KEY && !env.SMTP_HOST) {
    const error = 'NO_EMAIL_PROVIDER_CONFIGURED'
    serverLogBuffer.error('[EMAIL] No email provider configured', { to, subject })
    return { ok: false, error, provider: 'none' }
  }

  // SMTP was tried but failed
  return { ...smtpResult, provider: 'smtp' }
}

