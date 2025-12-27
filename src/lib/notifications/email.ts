import { getEnvSafe } from '@/lib/env'
import { serverLogBuffer } from '@/lib/serverLogBuffer'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

export interface SendEmailResult {
  ok: boolean
  provider: 'resend' | 'smtp' | 'disabled'
  providerMessageId?: string
  errorCode?: string
  error?: string
}

/**
 * Send email via Resend or SMTP fallback
 * Never throws - always returns structured result
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text, replyTo } = options
  const env = getEnvSafe()
  
  // Type guard for helper booleans
  const envWithHelpers = 'hasResend' in env ? env as typeof env & { hasResend: boolean; hasSmtp: boolean; hasEmailProvider: boolean; hasTwilio: boolean } : null
  if (!envWithHelpers) {
    return {
      ok: false,
      provider: 'disabled',
      errorCode: 'ENV_CONFIG_ERROR',
      error: 'Environment configuration error',
    }
  }

  // Try Resend first if configured
  if (envWithHelpers.hasResend && env.RESEND_API_KEY && env.EMAIL_FROM) {
    try {
      const { Resend } = require('resend')
      const resend = new Resend(env.RESEND_API_KEY)

      const result = await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        text,
        ...(replyTo && { reply_to: replyTo }),
      })

      const providerMessageId = result.data?.id || 'unknown'
      serverLogBuffer.info('[EMAIL] Sent via Resend', {
        to,
        subject,
        providerMessageId,
      })

      return {
        ok: true,
        provider: 'resend',
        providerMessageId,
      }
    } catch (error: any) {
      serverLogBuffer.warn('[EMAIL] Resend failed, trying SMTP fallback', {
        to,
        subject,
        error: error?.message,
      })
      // Fall through to SMTP
    }
  }

  // Try SMTP fallback if configured
  if (envWithHelpers.hasSmtp && env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS) {
    try {
      const nodemailer = require('nodemailer')
      
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT),
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
        ...(replyTo && { replyTo }),
      })

      const providerMessageId = info.messageId || 'unknown'
      serverLogBuffer.info('[EMAIL] Sent via SMTP', {
        to,
        subject,
        providerMessageId,
      })

      return {
        ok: true,
        provider: 'smtp',
        providerMessageId,
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error'
      serverLogBuffer.error('[EMAIL] SMTP send failed', {
        to,
        subject,
        error: errorMessage,
        stack: error?.stack,
      })

      return {
        ok: false,
        provider: 'smtp',
        errorCode: 'SMTP_SEND_FAILED',
        error: errorMessage,
      }
    }
  }

  // No provider configured
  const errorCode = 'NO_EMAIL_PROVIDER_CONFIGURED'
  serverLogBuffer.error('[EMAIL] No email provider configured', {
    to,
    subject,
    hasResend: envWithHelpers.hasResend,
    hasSmtp: envWithHelpers.hasSmtp,
  })

  return {
    ok: false,
    provider: 'disabled',
    errorCode,
    error: 'No email provider configured. Set RESEND_API_KEY or SMTP_* variables.',
  }
}

