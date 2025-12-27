import { getEnvSafe } from '@/lib/env'
import { serverLogBuffer } from '@/lib/serverLogBuffer'

export interface SendSmsOptions {
  to: string
  body: string
}

export interface SendSmsResult {
  ok: boolean
  provider: 'twilio' | 'disabled'
  providerMessageId?: string
  errorCode?: string
  error?: string
}

/**
 * Send SMS via Twilio
 * Never throws - always returns structured result
 */
export async function sendSms(options: SendSmsOptions): Promise<SendSmsResult> {
  const { to, body } = options
  const env = getEnvSafe()
  
  // Type guard for helper booleans
  const envWithHelpers = 'hasTwilio' in env ? env as typeof env & { hasTwilio: boolean } : null
  if (!envWithHelpers || !envWithHelpers.hasTwilio) {
    const errorCode = 'TWILIO_NOT_CONFIGURED'
    serverLogBuffer.error('[SMS] Twilio not configured', {
      to,
      hasTwilio: false,
    })
    return {
      ok: false,
      provider: 'disabled',
      errorCode,
      error: 'Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.',
    }
  }

  // Validate phone number format
  if (env.TWILIO_FROM_NUMBER && !env.TWILIO_FROM_NUMBER.startsWith('+')) {
    const errorCode = 'TWILIO_FROM_NUMBER_INVALID'
    serverLogBuffer.error('[SMS] Invalid from number format', {
      from: env.TWILIO_FROM_NUMBER,
    })
    return {
      ok: false,
      provider: 'twilio',
      errorCode,
      error: `TWILIO_FROM_NUMBER must start with + (got: ${env.TWILIO_FROM_NUMBER})`,
    }
  }

  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
    const errorCode = 'TWILIO_NOT_CONFIGURED'
    return {
      ok: false,
      provider: 'disabled',
      errorCode,
      error: 'Twilio credentials incomplete',
    }
  }

  try {
    const twilio = require('twilio')
    const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)

    const result = await twilioClient.messages.create({
      body,
      from: env.TWILIO_FROM_NUMBER,
      to,
    })

    const providerMessageId = result.sid || 'unknown'
    serverLogBuffer.info('[SMS] Sent successfully', {
      to,
      from: env.TWILIO_FROM_NUMBER,
      providerMessageId,
    })

    return {
      ok: true,
      provider: 'twilio',
      providerMessageId,
    }
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error'
    serverLogBuffer.error('[SMS] Send failed', {
      to,
      from: env.TWILIO_FROM_NUMBER,
      error: errorMessage,
      stack: error?.stack,
    })

    return {
      ok: false,
      provider: 'twilio',
      errorCode: 'TWILIO_SEND_FAILED',
      error: errorMessage,
    }
  }
}

