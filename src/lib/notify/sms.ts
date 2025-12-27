import { getEnvSafe } from '@/lib/env'
import { serverLogBuffer } from '@/lib/serverLogBuffer'

interface SendSmsResult {
  ok: boolean
  providerMessageId?: string
  error?: string
}

export async function sendSmsTwilio(to: string, body: string): Promise<SendSmsResult> {
  const env = getEnvSafe()

  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    const error = 'TWILIO_NOT_CONFIGURED'
    serverLogBuffer.error('[SMS] Twilio not configured', { to })
    return { ok: false, error }
  }

  if (!env.TWILIO_FROM_NUMBER) {
    const error = 'TWILIO_FROM_NUMBER_NOT_SET'
    serverLogBuffer.error('[SMS] TWILIO_FROM_NUMBER not set', { to })
    return { ok: false, error }
  }

  // Validate phone number format
  if (!env.TWILIO_FROM_NUMBER.startsWith('+')) {
    const error = `TWILIO_FROM_NUMBER_INVALID: ${env.TWILIO_FROM_NUMBER} (must start with +)`
    serverLogBuffer.error('[SMS] Invalid from number format', {
      from: env.TWILIO_FROM_NUMBER,
    })
    return { ok: false, error }
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

    return { ok: true, providerMessageId }
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error'
    serverLogBuffer.error('[SMS] Send failed', {
      to,
      from: env.TWILIO_FROM_NUMBER,
      error: errorMessage,
      stack: error?.stack,
    })

    return { ok: false, error: errorMessage }
  }
}

