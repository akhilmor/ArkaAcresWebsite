import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  // SMTP fallback
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_SECURE: z.string().optional(), // "true" | "false"
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  // Owner contact
  OWNER_EMAIL: z.string().email().default('arkaacres@gmail.com'),
  OWNER_PHONE: z.string().default('+14695369020'),
  // Twilio
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  SMS_TO_NUMBER: z.string().default('+14695369020'),
  ADMIN_PASSWORD: z.string().optional(),
  ENABLE_GUEST_SMS: z.string().default('false'),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

type EnvResult =
  | { ok: true; env: z.infer<typeof envSchema> }
  | { ok: false; missing: string[]; errors: Record<string, string> }

export function getEnv(): EnvResult {
  const raw = {
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    OWNER_EMAIL: process.env.OWNER_EMAIL || 'arkaacres@gmail.com',
    OWNER_PHONE: process.env.OWNER_PHONE || '+14695369020',
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
    SMS_TO_NUMBER: process.env.SMS_TO_NUMBER || '+14695369020',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ENABLE_GUEST_SMS: process.env.ENABLE_GUEST_SMS || 'false',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
  }

  // Validate required fields
  const missing: string[] = []
  const errors: Record<string, string> = {}

  if (!raw.DATABASE_URL) missing.push('DATABASE_URL')

  // Validate phone numbers if provided
  if (raw.TWILIO_FROM_NUMBER && !raw.TWILIO_FROM_NUMBER.startsWith('+')) {
    errors.TWILIO_FROM_NUMBER = 'Must start with +'
  }

  if (raw.SMS_TO_NUMBER && !raw.SMS_TO_NUMBER.startsWith('+')) {
    errors.SMS_TO_NUMBER = 'Must start with +'
  }

  // Dev fallback for EMAIL_FROM
  if (!raw.EMAIL_FROM && raw.NODE_ENV === 'development') {
    raw.EMAIL_FROM = 'onboarding@resend.dev'
    console.warn(
      '⚠️  [ENV] EMAIL_FROM not set, using fallback: onboarding@resend.dev (DEV ONLY)'
    )
  }

  if (missing.length > 0 || Object.keys(errors).length > 0) {
    return { ok: false, missing, errors }
  }

  const parsed = envSchema.parse(raw)
  return { ok: true, env: parsed }
}

export function getEnvSafe() {
  const result = getEnv()
  if (!result.ok) {
    console.error('[ENV] Configuration errors:', result)
    // Return defaults for non-critical fields
  return {
    DATABASE_URL: process.env.DATABASE_URL || '',
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM || (process.env.NODE_ENV === 'development' ? 'onboarding@resend.dev' : undefined),
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    OWNER_EMAIL: process.env.OWNER_EMAIL || 'arkaacres@gmail.com',
    OWNER_PHONE: process.env.OWNER_PHONE || '+14695369020',
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
    SMS_TO_NUMBER: process.env.SMS_TO_NUMBER || '+14695369020',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ENABLE_GUEST_SMS: process.env.ENABLE_GUEST_SMS === 'true',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  }
  }
  const env = {
    ...result.env,
    ENABLE_GUEST_SMS: result.env.ENABLE_GUEST_SMS === 'true',
    SMTP_SECURE: result.env.SMTP_SECURE === 'true',
  }
  
  // Add helper booleans
  return {
    ...env,
    hasResend: !!(env.RESEND_API_KEY && env.EMAIL_FROM),
    hasSmtp: !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS),
    hasEmailProvider: !!(env.RESEND_API_KEY && env.EMAIL_FROM) || !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS),
    hasTwilio: !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER),
  }
}

