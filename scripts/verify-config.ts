#!/usr/bin/env tsx

/**
 * Verify notification configuration
 * Prints which providers are active
 */

import { getEnvSafe } from '../src/lib/env'

const env = getEnvSafe()

// Check if helper booleans exist (they should always exist from getEnvSafe)
if (!('hasResend' in env)) {
  console.error('❌ Environment configuration error - helper booleans missing')
  process.exit(1)
}

// Type assertion for helper booleans
const envWithHelpers = env as typeof env & { hasResend: boolean; hasSmtp: boolean; hasEmailProvider: boolean; hasTwilio: boolean }

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📧 Notification Configuration Status')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')

// Email Provider
if (envWithHelpers.hasResend) {
  console.log('✅ Email Provider: Resend')
  console.log(`   EMAIL_FROM: ${env.EMAIL_FROM || 'not set'}`)
} else if (envWithHelpers.hasSmtp) {
  console.log('✅ Email Provider: SMTP')
  console.log(`   SMTP_HOST: ${env.SMTP_HOST}`)
  console.log(`   SMTP_PORT: ${env.SMTP_PORT}`)
  console.log(`   SMTP_USER: ${env.SMTP_USER}`)
} else {
  console.log('❌ Email Provider: None')
  console.log('   To enable:')
  console.log('   - Set RESEND_API_KEY + EMAIL_FROM (Resend)')
  console.log('   - OR set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (SMTP)')
}

console.log('')

// SMS Provider
if (envWithHelpers.hasTwilio) {
  console.log('✅ SMS Provider: Twilio')
  console.log(`   TWILIO_FROM_NUMBER: ${env.TWILIO_FROM_NUMBER}`)
  console.log(`   SMS_TO_NUMBER: ${env.SMS_TO_NUMBER}`)
} else {
  console.log('❌ SMS Provider: None')
  console.log('   To enable:')
  console.log('   - Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER')
}

console.log('')

// Guest SMS
console.log(`Guest SMS: ${env.ENABLE_GUEST_SMS ? 'Enabled' : 'Disabled'}`)

console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
